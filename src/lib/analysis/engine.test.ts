import { describe, expect, it } from 'vitest';
import { analyze, avoidCandidates, isFastReactor } from './engine';
import { rng } from './stats';
import { addDays, dateRange } from '../dates';
import type { DayLog, Entry, FoodView, SymptomEvent } from '../../types';

// ---- synthetic world ----
const view = (id: string, extra: Partial<FoodView> = {}): FoodView => ({
  id, name: id, category: 'other', kind: 'ingredient',
  fodmap: { fructans: null, gos: null, lactose: null, fructose: null, polyols: null }, overall: 'low', groupUnknown: false, polyolType: null,
  servings: { low: null, moderate: null, high: null }, confidence: 'high', conflictCount: 0, tags: [], ingredients: [], ref: null, user: null, favorite: false, ...extra,
});

function world(opts: { days?: number; trigger?: { id: string; lag: number; bump: number; prob?: number }; fructanLoad?: boolean; fast?: { id: string }; seed?: number }) {
  const rand = rng(opts.seed ?? 7);
  const n = opts.days ?? 90;
  const from = '2026-01-01', to = addDays(from, n - 1);
  const foods: Record<string, FoodView> = {};
  for (let i = 0; i < 30; i++) foods[`f${i}`] = view(`f${i}`);
  foods.onion = view('onion', { fodmap: { fructans: 'high', gos: null, lactose: null, fructose: null, polyols: null }, overall: 'high' });
  foods.garlic = view('garlic', { fodmap: { fructans: 'high', gos: null, lactose: null, fructose: null, polyols: null }, overall: 'high' });
  foods.egg = view('egg', { tags: ['egg'] });
  foods.omelet = view('omelet', { kind: 'dish', ingredients: [{ foodId: 'egg' }, { foodId: 'f1' }] });
  const entries: Entry[] = []; const dayLogs: DayLog[] = []; const events: SymptomEvent[] = [];
  const bumps = new Map<string, number>();
  const ids = Object.keys(foods).filter((k) => k !== 'egg');
  let eid = 0;
  for (const date of dateRange(from, to)) {
    const count = 5 + Math.floor(rand() * 4);
    const chosen = new Set<string>();
    while (chosen.size < count) chosen.add(ids[Math.floor(rand() * ids.length)]);
    let fructans = 0;
    for (const id of chosen) {
      const slot = (['breakfast', 'lunch', 'dinner', 'snack'] as const)[Math.floor(rand() * 4)];
      const time = `${String(8 + Math.floor(rand() * 12)).padStart(2, '0')}:00`;
      entries.push({ id: `e${eid++}`, date, slot, foodId: id, portion: 'M', time, notes: '', createdAt: 0, updatedAt: 0, deleted: 0 });
      if (foods[id].fodmap.fructans === 'high') fructans += 3;
      if (opts.trigger && id === opts.trigger.id && rand() < (opts.trigger.prob ?? 0.9)) {
        const d = addDays(date, opts.trigger.lag); bumps.set(d, (bumps.get(d) ?? 0) + opts.trigger.bump);
      }
      if (opts.fast && id === opts.fast.id && rand() < 0.7) {
        const [h] = time.split(':').map(Number);
        events.push({ id: `ev${events.length}`, date, time: `${String(Math.min(23, h + 1)).padStart(2, '0')}:30`, severity: 6, symptoms: ['pain'], notes: '', updatedAt: 0, deleted: 0 });
      }
    }
    if (opts.fructanLoad) { const d = addDays(date, 1); bumps.set(d, (bumps.get(d) ?? 0) + fructans * 0.6); }
    // random background flare-ups, ~1 per 6 days
    if (rand() < 0.16) events.push({ id: `ev${events.length}`, date, time: '21:00', severity: 4, symptoms: ['bloating'], notes: '', updatedAt: 0, deleted: 0 });
  }
  for (const date of dateRange(from, to)) {
    const base = 1.5 + (rand() + rand() - 1) * 1.5; // noisy baseline around 1.5
    const distress = Math.max(0, Math.min(10, Math.round(base + (bumps.get(date) ?? 0))));
    dayLogs.push({ id: date, distress, symptoms: distress >= 5 ? ['bloating', 'pain'] : [], exercise: rand() < 0.3 ? 'moderate' : 'none', notes: '', updatedAt: 0, deleted: 0 });
  }
  return { entries, dayLogs, events, resolve: (id: string) => foods[id] ?? null, from, to };
}

describe('analysis engine', () => {
  it('finds a planted next-day trigger and ranks it first', () => {
    const w = world({ trigger: { id: 'f3', lag: 1, bump: 4 } });
    const a = analyze({ ...w, seed: 1 });
    const foods = a.features.filter((f) => f.kind === 'food');
    expect(foods[0].label).toBe('f3');
    expect(foods[0].bestLag).toBe(1);
    expect(foods[0].confidence).toBe('strong');
    expect(avoidCandidates(a).map((f) => f.label)).toContain('f3');
  });

  it('keeps false positives rare on decoy foods', () => {
    const w = world({ trigger: { id: 'f3', lag: 2, bump: 4 } });
    const a = analyze({ ...w, seed: 2 });
    const strongDecoys = a.features.filter((f) => f.kind === 'food' && f.label !== 'f3' && f.confidence === 'strong');
    expect(strongDecoys.length).toBeLessThanOrEqual(3);
    const target = a.features.find((f) => f.label === 'f3')!;
    expect(target.bestLag).toBe(2);
  });

  it('detects a two-day-lag trigger that only fires sometimes', () => {
    const w = world({ trigger: { id: 'f7', lag: 2, bump: 5, prob: 0.6 }, days: 120 });
    const a = analyze({ ...w, seed: 3 });
    const t = a.features.find((f) => f.label === 'f7')!;
    expect(t.bestLag).toBe(2);
    expect(['strong', 'emerging']).toContain(t.confidence);
  });

  it('shows cumulative fructan load correlating with next-day distress', () => {
    const w = world({ fructanLoad: true });
    const a = analyze({ ...w, seed: 4 });
    const fr = a.loadCorrelation.find((c) => c.group === 'fructans')!;
    expect(fr.rhoNextDay).toBeGreaterThan(0.25);
    const group = a.features.find((f) => f.key === 'group:fructans')!;
    expect(group.bestLag).toBe(1);
  });

  it('flags fast reactors from timed flare-ups', () => {
    const w = world({ fast: { id: 'f12' } });
    const a = analyze({ ...w, seed: 5 });
    const f = a.features.find((x) => x.label === 'f12')!;
    expect(isFastReactor(f)).toBe(true);
    expect(f.fast!.medianDelayH).toBeLessThanOrEqual(2);
    const decoy = a.features.find((x) => x.label === 'f5')!;
    expect(isFastReactor(decoy)).toBe(false);
  });

  it('attributes dish exposures to ingredients and tags', () => {
    const w = world({ trigger: { id: 'omelet', lag: 0, bump: 4 } });
    const a = analyze({ ...w, seed: 6 });
    const egg = a.features.find((f) => f.key === 'food:egg')!;
    const tag = a.features.find((f) => f.key === 'tag:egg')!;
    expect(egg.kind).toBe('ingredient');
    expect(egg.bestLag).toBe(0);
    expect(tag.confidence).toBe('strong');
  });

  it('hides everything with too little data', () => {
    const w = world({ days: 5 });
    const a = analyze({ ...w, seed: 8 });
    expect(a.features.every((f) => f.confidence === 'hidden' || f.confidence === 'weak')).toBe(true);
    expect(a.loggedDays).toBe(5);
  });
});
