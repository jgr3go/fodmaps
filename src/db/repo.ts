import { db } from './schema';
import { EMPTY_PROFILE, REF_BY_ID, isRefKey, stripRef } from '../lib/fodmap';
import type { Category, DayLog, Entry, Food, FodmapProfile, Phase, Portion, Slot, SymptomEvent } from '../types';

export const uuid = () => crypto.randomUUID();
const now = () => Date.now();

// ---- foods ----
export async function listFoods(): Promise<Food[]> {
  return db.foods.where('deleted').equals(0).toArray();
}
export async function saveFood(f: Food): Promise<Food> {
  const next = { ...f, updatedAt: now() }; await db.foods.put(next); return next;
}
export async function deleteFood(id: string): Promise<void> {
  const f = await db.foods.get(id); if (f) await db.foods.put({ ...f, deleted: 1, updatedAt: now() });
}
export function newFood(partial: Partial<Food> & { name: string }): Food {
  return {
    id: uuid(), aliases: [], category: 'other', kind: 'ingredient', ingredients: [], fodmap: { ...EMPTY_PROFILE },
    overrideFodmap: false, refId: null, tags: [], source: 'user', notes: '', favorite: false, updatedAt: now(), deleted: 0,
    ...partial,
  };
}
/** Free text that matched nothing becomes a user food so it is still counted by the analysis. */
export async function foodFromFreeText(name: string, category: Category = 'other'): Promise<Food> {
  const clean = name.trim().toLowerCase();
  const existing = (await db.foods.where('name').equals(clean).toArray()).find((f) => !f.deleted);
  if (existing) return existing;
  return saveFood(newFood({ name: clean, category, source: 'freeText' }));
}
/** Create or fetch the override record for a reference food. */
export async function overrideFor(refId: string): Promise<Food> {
  const existing = (await db.foods.where('refId').equals(refId).toArray()).find((f) => !f.deleted && f.source === 'override');
  if (existing) return existing;
  const ref = REF_BY_ID.get(refId)!;
  return saveFood(newFood({ name: ref.name, category: ref.category, refId, fodmap: { ...ref.fodmap }, source: 'override', tags: [] }));
}
export async function setOverrideProfile(refId: string, fodmap: FodmapProfile): Promise<void> {
  const ov = await overrideFor(refId); await saveFood({ ...ov, fodmap, overrideFodmap: true });
}
export async function clearOverrideProfile(refId: string): Promise<void> {
  const ov = await overrideFor(refId); await saveFood({ ...ov, overrideFodmap: false });
}
export async function toggleFavorite(foodId: string): Promise<void> {
  if (isRefKey(foodId)) { const ov = await overrideFor(stripRef(foodId)); await saveFood({ ...ov, favorite: !ov.favorite }); return; }
  const f = await db.foods.get(foodId); if (f) await saveFood({ ...f, favorite: !f.favorite });
}

// ---- entries ----
export async function entriesForDate(date: string): Promise<Entry[]> {
  return (await db.entries.where('date').equals(date).toArray()).filter((e) => !e.deleted).sort((a, b) => a.createdAt - b.createdAt);
}
export async function entriesBetween(from: string, to: string): Promise<Entry[]> {
  return (await db.entries.where('date').between(from, to, true, true).toArray()).filter((e) => !e.deleted);
}
export async function addEntry(p: { date: string; slot: Slot; foodId: string; portion?: Portion; time?: string | null; notes?: string }): Promise<Entry> {
  const e: Entry = { id: uuid(), portion: 'M', time: null, notes: '', ...p, createdAt: now(), updatedAt: now(), deleted: 0 };
  await db.entries.put(e); return e;
}
export async function updateEntry(e: Entry): Promise<void> { await db.entries.put({ ...e, updatedAt: now() }); }
export async function deleteEntry(id: string): Promise<void> {
  const e = await db.entries.get(id); if (e) await db.entries.put({ ...e, deleted: 1, updatedAt: now() });
}
/** Most-used food ids in the last 60 days, for quick add. */
export async function recentFoodIds(limit = 30): Promise<string[]> {
  const all = (await db.entries.orderBy('date').reverse().limit(600).toArray()).filter((e) => !e.deleted);
  const counts = new Map<string, number>();
  for (const e of all) counts.set(e.foodId, (counts.get(e.foodId) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit).map(([id]) => id);
}

// ---- day logs ----
export async function getDayLog(date: string): Promise<DayLog | undefined> {
  const d = await db.dayLogs.get(date); return d && !d.deleted ? d : undefined;
}
export async function upsertDayLog(date: string, patch: Partial<DayLog>): Promise<DayLog> {
  const cur = (await db.dayLogs.get(date)) ?? { id: date, distress: null, symptoms: [], exercise: null, notes: '', updatedAt: 0, deleted: 0 as const };
  const next: DayLog = { ...cur, ...patch, id: date, deleted: 0, updatedAt: now() };
  await db.dayLogs.put(next); return next;
}
export async function dayLogsBetween(from: string, to: string): Promise<DayLog[]> {
  return (await db.dayLogs.where('id').between(from, to, true, true).toArray()).filter((d) => !d.deleted);
}

// ---- symptom events ----
export async function eventsForDate(date: string): Promise<SymptomEvent[]> {
  return (await db.symptomEvents.where('date').equals(date).toArray()).filter((e) => !e.deleted).sort((a, b) => a.time.localeCompare(b.time));
}
export async function eventsBetween(from: string, to: string): Promise<SymptomEvent[]> {
  return (await db.symptomEvents.where('date').between(from, to, true, true).toArray()).filter((e) => !e.deleted);
}
export async function addEvent(p: Omit<SymptomEvent, 'id' | 'updatedAt' | 'deleted'>): Promise<SymptomEvent> {
  const e: SymptomEvent = { ...p, id: uuid(), updatedAt: now(), deleted: 0 }; await db.symptomEvents.put(e); return e;
}
export async function deleteEvent(id: string): Promise<void> {
  const e = await db.symptomEvents.get(id); if (e) await db.symptomEvents.put({ ...e, deleted: 1, updatedAt: now() });
}

// ---- phases ----
export async function listPhases(): Promise<Phase[]> {
  return (await db.phases.toArray()).filter((p) => !p.deleted).sort((a, b) => b.startDate.localeCompare(a.startDate));
}
export async function savePhase(p: Phase): Promise<void> { await db.phases.put({ ...p, updatedAt: now() }); }
export async function deletePhase(id: string): Promise<void> {
  const p = await db.phases.get(id); if (p) await db.phases.put({ ...p, deleted: 1, updatedAt: now() });
}

// ---- settings ----
export async function getSetting(key: string): Promise<string | null> { return (await db.settings.get(key))?.value ?? null; }
export async function setSetting(key: string, value: string): Promise<void> { await db.settings.put({ key, value }); }
