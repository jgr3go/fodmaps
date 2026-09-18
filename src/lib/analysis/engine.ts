/**
 * Deterministic, on-device analysis of food exposures vs GI symptoms.
 *
 *  1. Lagged exposure lift: for every feature (food, ingredient, FODMAP group, sensitivity tag, exercise),
 *     compare distress on days 0..3 after exposure with distress on unexposed days. A permutation test on the
 *     exposure dates gives a p-value; results are hidden below a minimum exposure count.
 *  2. Cumulative load: trailing 72 h FODMAP load per group vs distress (Spearman), catches "the stack".
 *  3. Fast reactions: timed flare-ups within 0-4 h of a timed/slot-timed exposure vs the base flare-up rate,
 *     which separates allergy-like from FODMAP-like timing.
 *  4. Symptom-type split: same lift on the presence of each symptom type.
 */
import { GROUPS, PORTION_WEIGHT, SYMPTOMS, type DayLog, type Entry, type FoodView, type Group, type Symptom, type SymptomEvent } from '../../types';
import { absMinutes, addDays, dateRange, defaultSlotTime, diffDays } from '../dates';
import { adjustProfile, loadOf } from '../fodmap';
import { mean, median, rng, sd, shuffle, spearman } from './stats';

export const MAX_LAG = 3;
export const MIN_EXPOSURES = 4;
export const STRONG_EXPOSURES = 8;
const PERMUTATIONS = 200;
const FAST_WINDOW_MIN = 4 * 60;

export type FeatureKind = 'food' | 'ingredient' | 'group' | 'tag' | 'exercise';
export interface LagStat { lag: number; n: number; nBaseline: number; meanExposed: number; meanBaseline: number; lift: number; p: number }
export interface FastStat { exposuresTimed: number; eventsWithin4h: number; expected: number; ratio: number; medianDelayH: number | null }
export interface SymptomLift { symptom: Symptom; n: number; rateExposed: number; rateBaseline: number; lift: number }
export type Confidence = 'hidden' | 'emerging' | 'weak' | 'strong';
export interface FeatureResult {
  key: string; kind: FeatureKind; label: string; foodId?: string;
  exposures: number; exposureDays: number; lags: LagStat[]; bestLag: number; bestLift: number; bestP: number;
  effect: number; confidence: Confidence; fast: FastStat | null; bySymptom: SymptomLift[];
}
export interface DaySeries { date: string; distress: number | null; symptoms: Symptom[]; load: Record<Group, number>; total: number; trailing72: number; trailingByGroup: Record<Group, number>; entries: number }
export interface LoadCorrelation { group: Group | 'total'; rhoSameDay: number; rhoNextDay: number; n: number }
export interface Analysis {
  from: string; to: string; loggedDays: number; entryCount: number; meanDistress: number; badDays: number;
  days: DaySeries[]; features: FeatureResult[]; loadCorrelation: LoadCorrelation[];
}
export interface AnalysisInput {
  entries: Entry[]; dayLogs: DayLog[]; events: SymptomEvent[]; resolve: (id: string) => FoodView | null; from: string; to: string; seed?: number;
}

interface Exposure { date: string; minutes: number; dose: number }
interface Feature { key: string; kind: FeatureKind; label: string; foodId?: string; exposures: Exposure[] }

function flattenIngredients(v: FoodView, resolve: (id: string) => FoodView | null, depth = 0, seen = new Set<string>()): FoodView[] {
  if (depth > 3) return [];
  const out: FoodView[] = [];
  for (const i of v.ingredients) {
    if (seen.has(i.foodId)) continue; seen.add(i.foodId);
    const iv = resolve(i.foodId); if (!iv) continue;
    out.push(iv, ...flattenIngredients(iv, resolve, depth + 1, seen));
  }
  return out;
}

export function buildFeatures(entries: Entry[], dayLogs: DayLog[], resolve: (id: string) => FoodView | null): Feature[] {
  const map = new Map<string, Feature>();
  const add = (key: string, kind: FeatureKind, label: string, e: Exposure, foodId?: string) => {
    let f = map.get(key); if (!f) { f = { key, kind, label, foodId, exposures: [] }; map.set(key, f); } f.exposures.push(e);
  };
  for (const e of entries) {
    const v = resolve(e.foodId); if (!v) continue;
    const minutes = absMinutes(e.date, e.time ?? defaultSlotTime(e.slot));
    const w = PORTION_WEIGHT[e.portion];
    add(`food:${v.id}`, v.kind === 'dish' ? 'food' : 'food', v.name, { date: e.date, minutes, dose: w }, v.id);
    const parts = v.kind === 'dish' ? flattenIngredients(v, resolve) : [];
    for (const p of parts) add(`food:${p.id}`, 'ingredient', p.name, { date: e.date, minutes, dose: w }, p.id);
    const profile = adjustProfile(v.fodmap, e.portion);
    const load = loadOf(profile, 'M');
    for (const g of GROUPS) if (load[g] >= 1.5) add(`group:${g}`, 'group', g, { date: e.date, minutes, dose: load[g] });
    const tags = new Set([...v.tags, ...parts.flatMap((p) => p.tags)]);
    for (const t of tags) add(`tag:${t}`, 'tag', t, { date: e.date, minutes, dose: w });
  }
  for (const d of dayLogs) if (d.exercise && d.exercise !== 'none') add(`exercise:${d.exercise}`, 'exercise', `exercise (${d.exercise})`, { date: d.id, minutes: absMinutes(d.id, '12:00'), dose: 1 });
  return [...map.values()];
}

function dayScoreMap(dayLogs: DayLog[], events: SymptomEvent[]): Map<string, number> {
  const m = new Map<string, number>();
  for (const d of dayLogs) if (d.distress != null) m.set(d.id, d.distress);
  for (const ev of events) if (!m.has(ev.date)) m.set(ev.date, Math.max(m.get(ev.date) ?? 0, ev.severity));
  return m;
}

/** Lift at each lag for one feature. exposureDates: distinct dates; scores: date->value; allDates: dates with scores. */
export function lagStats(exposureDates: Set<string>, scores: Map<string, number>, scoredDates: string[], rand: () => number, perms = PERMUTATIONS): LagStat[] {
  // A scored day is "clean" if no exposure fell on it or the MAX_LAG days before it.
  const contaminated = new Set<string>();
  for (const d of exposureDates) for (let l = 0; l <= MAX_LAG; l++) contaminated.add(addDays(d, l));
  const baselineVals = scoredDates.filter((d) => !contaminated.has(d)).map((d) => scores.get(d)!);
  const mb = mean(baselineVals);
  const statFor = (dates: Set<string>, lag: number) => {
    const vals: number[] = []; for (const d of dates) { const s = scores.get(addDays(d, lag)); if (s != null) vals.push(s); }
    return { vals, m: mean(vals) };
  };
  const out: LagStat[] = [];
  for (let lag = 0; lag <= MAX_LAG; lag++) {
    const { vals, m } = statFor(exposureDates, lag);
    const lift = vals.length && baselineVals.length ? m - mb : NaN;
    let p = NaN;
    if (vals.length >= MIN_EXPOSURES && baselineVals.length >= MIN_EXPOSURES && Number.isFinite(lift)) {
      // Permutation: reassign the same number of exposure dates at random among days that could have been exposed.
      const pool = scoredDates;
      let ge = 0; const k = exposureDates.size;
      for (let i = 0; i < perms; i++) {
        const fake = new Set(shuffle(pool, rand).slice(0, k));
        const cont = new Set<string>(); for (const d of fake) for (let l = 0; l <= MAX_LAG; l++) cont.add(addDays(d, l));
        const fb = mean(scoredDates.filter((d) => !cont.has(d)).map((d) => scores.get(d)!));
        const { vals: fv, m: fm } = statFor(fake, lag);
        if (fv.length && Number.isFinite(fb) && fm - fb >= lift) ge++;
      }
      p = (ge + 1) / (perms + 1);
    }
    out.push({ lag, n: vals.length, nBaseline: baselineVals.length, meanExposed: m, meanBaseline: mb, lift, p });
  }
  return out;
}

function fastHits(exposures: Exposure[], evMin: number[]): { hits: number; delays: number[] } {
  let hits = 0; const delays: number[] = [];
  for (const x of exposures) {
    let best = Infinity;
    for (const m of evMin) if (m > x.minutes && m - x.minutes <= FAST_WINDOW_MIN && m - x.minutes < best) best = m - x.minutes;
    if (best < Infinity) { hits++; delays.push(best / 60); }
  }
  return { hits, delays };
}
/**
 * Fast-reaction stat. The base rate is the fraction of ALL exposures (every food logged) that were followed by a
 * flare-up within 4 h, which controls for foods that merely share meals with the real culprit.
 */
function fastStats(f: Feature, evMin: number[], baseRate: number): FastStat | null {
  if (!f.exposures.length || !evMin.length) return null;
  const { hits, delays } = fastHits(f.exposures, evMin);
  const expected = f.exposures.length * baseRate;
  return { exposuresTimed: f.exposures.length, eventsWithin4h: hits, expected, ratio: expected > 0 ? hits / expected : hits > 0 ? Infinity : 0, medianDelayH: delays.length ? median(delays) : null };
}

function symptomLifts(exposureDates: Set<string>, dayLogs: DayLog[], events: SymptomEvent[]): SymptomLift[] {
  const has = new Map<string, Set<Symptom>>();
  for (const d of dayLogs) if (d.distress != null || d.symptoms.length) has.set(d.id, new Set(d.symptoms));
  for (const e of events) { if (!has.has(e.date)) has.set(e.date, new Set()); for (const s of e.symptoms) has.get(e.date)!.add(s); }
  const contaminated = new Set<string>(); for (const d of exposureDates) for (let l = 0; l <= MAX_LAG; l++) contaminated.add(addDays(d, l));
  const exposedDays = [...has.keys()].filter((d) => contaminated.has(d));
  const baseDays = [...has.keys()].filter((d) => !contaminated.has(d));
  return SYMPTOMS.map((s) => {
    const re = exposedDays.length ? exposedDays.filter((d) => has.get(d)!.has(s)).length / exposedDays.length : NaN;
    const rb = baseDays.length ? baseDays.filter((d) => has.get(d)!.has(s)).length / baseDays.length : NaN;
    return { symptom: s, n: exposedDays.length, rateExposed: re, rateBaseline: rb, lift: re - rb };
  }).filter((x) => Number.isFinite(x.lift));
}

export function analyze(input: AnalysisInput): Analysis {
  const { entries, dayLogs, events, resolve, from, to } = input;
  const rand = rng(input.seed ?? 42);
  const scores = dayScoreMap(dayLogs, events);
  const allDates = dateRange(from, to);
  const scoredDates = allDates.filter((d) => scores.has(d));
  const loggedDays = scoredDates.length;

  // Day series with loads
  const loadByDate = new Map<string, Record<Group, number>>();
  const entriesByDate = new Map<string, number>();
  for (const e of entries) {
    const v = resolve(e.foodId); if (!v) continue;
    const l = loadOf(v.fodmap, e.portion);
    const cur = loadByDate.get(e.date) ?? { fructans: 0, gos: 0, lactose: 0, fructose: 0, polyols: 0 };
    for (const g of GROUPS) cur[g] += l[g];
    loadByDate.set(e.date, cur); entriesByDate.set(e.date, (entriesByDate.get(e.date) ?? 0) + 1);
  }
  const symptomsByDate = new Map(dayLogs.map((d) => [d.id, d.symptoms]));
  const days: DaySeries[] = allDates.map((date) => {
    const load = loadByDate.get(date) ?? { fructans: 0, gos: 0, lactose: 0, fructose: 0, polyols: 0 };
    const trailingByGroup = { fructans: 0, gos: 0, lactose: 0, fructose: 0, polyols: 0 };
    for (let k = 0; k < 3; k++) { const l = loadByDate.get(addDays(date, -k)); if (l) for (const g of GROUPS) trailingByGroup[g] += l[g]; }
    const total = GROUPS.reduce((a, g) => a + load[g], 0);
    const trailing72 = GROUPS.reduce((a, g) => a + trailingByGroup[g], 0);
    return { date, distress: scores.get(date) ?? null, symptoms: symptomsByDate.get(date) ?? [], load, total, trailing72, trailingByGroup, entries: entriesByDate.get(date) ?? 0 };
  });

  // Load correlations
  const withScore = days.filter((d) => d.distress != null && (d.entries > 0 || d.trailing72 > 0));
  const loadCorrelation: LoadCorrelation[] = [...GROUPS, 'total' as const].map((g) => {
    const x = withScore.map((d) => (g === 'total' ? d.trailing72 : d.trailingByGroup[g]));
    const y = withScore.map((d) => d.distress!);
    const nextPairs = withScore.map((d) => [g === 'total' ? d.trailing72 : d.trailingByGroup[g], scores.get(addDays(d.date, 1))] as const).filter((p) => p[1] != null) as [number, number][];
    return { group: g, rhoSameDay: spearman(x, y), rhoNextDay: spearman(nextPairs.map((p) => p[0]), nextPairs.map((p) => p[1])), n: withScore.length };
  });

  // Features
  const built = buildFeatures(entries, dayLogs, resolve);
  const evMin = events.map((e) => absMinutes(e.date, e.time));
  const allFoodExposures = built.filter((f) => f.kind === 'food').flatMap((f) => f.exposures);
  const baseFast = allFoodExposures.length ? fastHits(allFoodExposures, evMin).hits / allFoodExposures.length : 0;
  const features: FeatureResult[] = built.map((f) => {
    const exposureDates = new Set(f.exposures.map((e) => e.date));
    const lags = lagStats(exposureDates, scores, scoredDates, rand);
    const usable = lags.filter((l) => l.n >= MIN_EXPOSURES && Number.isFinite(l.lift));
    const best = usable.length ? usable.reduce((a, b) => (b.lift > a.lift ? b : a)) : null;
    const baseVals = scoredDates.map((d) => scores.get(d)!);
    const s = sd(baseVals) || 1;
    const effect = best ? best.lift / s : 0;
    let confidence: Confidence = 'hidden';
    if (best) {
      if (best.n >= STRONG_EXPOSURES && best.p < 0.05 && best.lift > 0) confidence = 'strong';
      else if (best.n >= MIN_EXPOSURES && best.p < 0.1 && best.lift > 0) confidence = 'emerging';
      else confidence = 'weak';
    }
    return {
      key: f.key, kind: f.kind, label: f.label, foodId: f.foodId, exposures: f.exposures.length, exposureDays: exposureDates.size,
      lags, bestLag: best?.lag ?? -1, bestLift: best?.lift ?? NaN, bestP: best?.p ?? NaN, effect, confidence,
      fast: fastStats(f, evMin, baseFast), bySymptom: symptomLifts(exposureDates, dayLogs, events),
    };
  });
  features.sort((a, b) => rankScore(b) - rankScore(a));

  const distressVals = scoredDates.map((d) => scores.get(d)!);
  return {
    from, to, loggedDays, entryCount: entries.length, meanDistress: mean(distressVals), badDays: distressVals.filter((v) => v >= 6).length,
    days, features, loadCorrelation,
  };
}

/** Sort key: strong > emerging > weak > hidden, then by lift. */
export function rankScore(f: FeatureResult): number {
  const c = f.confidence === 'strong' ? 3000 : f.confidence === 'emerging' ? 2000 : f.confidence === 'weak' ? 1000 : 0;
  return c + (Number.isFinite(f.bestLift) ? f.bestLift * 10 : 0) + (isFastReactor(f) ? 500 : 0);
}
export function isFastReactor(f: FeatureResult): boolean {
  return !!f.fast && f.fast.eventsWithin4h >= 3 && f.fast.ratio >= 2 && f.fast.eventsWithin4h / f.fast.exposuresTimed >= 0.4;
}
/** Candidates to avoid: strong and consistent, with a positive lift over at least half the lags. */
export function avoidCandidates(a: Analysis): FeatureResult[] {
  return a.features.filter((f) => (f.kind === 'food' || f.kind === 'ingredient') && f.confidence === 'strong' && f.bestLift >= 1);
}
export function daysUntilUseful(a: Analysis): number { return Math.max(0, 21 - a.loggedDays); }
export { diffDays };
