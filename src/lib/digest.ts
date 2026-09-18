/** Compact, anonymized digest of the analysis for the LLM summary endpoint. No free-text notes are included. */
import { avoidCandidates, isFastReactor, type Analysis } from './analysis/engine';
import { GROUPS } from '../types';

export function buildDigest(a: Analysis) {
  const r2 = (x: number) => (Number.isFinite(x) ? Math.round(x * 100) / 100 : null);
  const feat = (kinds: string[], n: number) => a.features.filter((f) => kinds.includes(f.kind) && f.confidence !== 'hidden').slice(0, n).map((f) => ({
    label: f.label, kind: f.kind, exposures: f.exposures, exposureDays: f.exposureDays, bestLag: f.bestLag, lift: r2(f.bestLift), p: r2(f.bestP), effect: r2(f.effect), confidence: f.confidence,
    fast: isFastReactor(f) ? { eventsWithin4h: f.fast!.eventsWithin4h, ratio: r2(f.fast!.ratio), medianDelayH: r2(f.fast!.medianDelayH ?? NaN) } : null,
    symptoms: f.bySymptom.filter((s) => s.lift > 0.15 && s.n >= 4).map((s) => `${s.symptom} +${Math.round(s.lift * 100)}pp`),
  }));
  return {
    period: { from: a.from, to: a.to, loggedDays: a.loggedDays, entries: a.entryCount, meanDistress: r2(a.meanDistress), badDays: a.badDays },
    foods: feat(['food', 'ingredient'], 25),
    groups: feat(['group'], 5),
    tags: feat(['tag'], 10),
    exercise: feat(['exercise'], 3),
    loadCorrelation: a.loadCorrelation.map((c) => ({ group: c.group, rhoSameDay: r2(c.rhoSameDay), rhoNextDay: r2(c.rhoNextDay), n: c.n })),
    avoidCandidates: avoidCandidates(a).map((f) => f.label),
    recentDays: a.days.slice(-28).map((d) => ({ date: d.date, distress: d.distress, symptoms: d.symptoms, load: Object.fromEntries(GROUPS.map((g) => [g, r2(d.load[g])])), entries: d.entries })),
    method: 'Lift = mean distress (0-10) on day+lag after exposure minus mean on unexposed days; p from permutation of exposure dates; strong = 8+ exposures and p<0.05; fast = flare-ups within 4h at 2x+ the rate of all exposures.',
  };
}
export type Digest = ReturnType<typeof buildDigest>;
