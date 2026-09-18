import referenceJson from '../data/reference.json';
import keywordsJson from '../data/keywords.json';
import { GROUPS, PORTION_WEIGHT, type Food, type FodmapProfile, type FoodView, type Group, type Portion, type Rating, type RefFood } from '../types';

export const REFERENCE = referenceJson as RefFood[];
export const REF_BY_ID = new Map(REFERENCE.map((r) => [r.id, r]));
export const KEYWORDS = keywordsJson as { keyword: string; group: string | null; rating: Rating; note: string | null }[];

export const RANK: Record<Exclude<Rating, null>, number> = { low: 1, moderate: 2, high: 3 };
const BY_RANK: Rating[] = [null, 'low', 'moderate', 'high'];

export const EMPTY_PROFILE: FodmapProfile = { fructans: null, gos: null, lactose: null, fructose: null, polyols: null };

export const refKey = (id: string) => `ref:${id}`;
export const isRefKey = (id: string) => id.startsWith('ref:');
export const stripRef = (id: string) => id.slice(4);

export function worst(p: FodmapProfile): Rating {
  let w = 0; for (const g of GROUPS) w = Math.max(w, p[g] ? RANK[p[g]!] : 0); return BY_RANK[w];
}

/** Portion adjusts one step: small drops a level, large raises one (never below low, never above high). */
export function adjustForPortion(r: Rating, portion: Portion): Rating {
  if (!r) return r;
  const n = RANK[r] + (portion === 'S' ? -1 : portion === 'L' ? 1 : 0);
  return BY_RANK[Math.min(3, Math.max(1, n))];
}
export function adjustProfile(p: FodmapProfile, portion: Portion): FodmapProfile {
  const out = { ...EMPTY_PROFILE }; for (const g of GROUPS) out[g] = adjustForPortion(p[g], portion); return out;
}

/** Numeric load contribution for one entry, per group. high=3, moderate=1.5, low=0.25, scaled by portion. */
export function loadOf(p: FodmapProfile, portion: Portion): Record<Group, number> {
  const w = PORTION_WEIGHT[portion];
  const val = (r: Rating) => (r === 'high' ? 3 : r === 'moderate' ? 1.5 : r === 'low' ? 0.25 : 0) * w;
  return { fructans: val(p.fructans), gos: val(p.gos), lactose: val(p.lactose), fructose: val(p.fructose), polyols: val(p.polyols) };
}

/** Dish profile = per-group max over ingredients, each scaled by its weight (weight < 1 steps down one). */
export function deriveDishProfile(ingredients: { profile: FodmapProfile; weight?: number }[]): FodmapProfile {
  const out = { ...EMPTY_PROFILE };
  for (const { profile, weight = 1 } of ingredients) {
    for (const g of GROUPS) {
      let r = profile[g]; if (!r) continue;
      if (weight < 0.5) r = BY_RANK[Math.max(1, RANK[r] - 1)] ?? r;
      const cur = out[g];
      if (!cur || RANK[r] > RANK[cur]) out[g] = r;
    }
  }
  return out;
}

/** Resolve a stored id to a view. userFoods map holds all non-deleted user foods by id; overrides by refId. */
export function resolveFood(id: string, userFoods: Map<string, Food>, overridesByRef: Map<string, Food>): FoodView | null {
  if (isRefKey(id)) {
    const ref = REF_BY_ID.get(stripRef(id)); if (!ref) return null;
    const ov = overridesByRef.get(ref.id);
    return viewFromRef(ref, ov ?? null);
  }
  const u = userFoods.get(id); if (!u) return null;
  return viewFromUser(u, userFoods, overridesByRef);
}

function viewFromRef(ref: RefFood, ov: Food | null): FoodView {
  const fodmap = ov?.overrideFodmap ? ov.fodmap : ref.fodmap;
  const overall = ov?.overrideFodmap ? worst(fodmap) : ref.overall;
  return {
    id: refKey(ref.id), name: ov?.name ?? ref.name, category: ref.category, kind: 'ingredient',
    fodmap, overall, groupUnknown: ov?.overrideFodmap ? false : ref.groupUnknown, polyolType: ref.polyolType,
    servings: { low: ref.lowServing, moderate: ref.moderateServing, high: ref.highServing },
    confidence: ov?.overrideFodmap ? 'user' : ref.confidence, conflictCount: ref.conflictCount,
    tags: ov ? Array.from(new Set([...ref.tags, ...ov.tags])) : ref.tags,
    ingredients: [], ref, user: ov, favorite: ov?.favorite ?? false,
  };
}

function viewFromUser(u: Food, userFoods: Map<string, Food>, overridesByRef: Map<string, Food>, depth = 0): FoodView {
  let fodmap = u.fodmap; let groupUnknown = false; let tags = new Set(u.tags);
  if (!u.overrideFodmap) {
    if (u.kind === 'dish' && u.ingredients.length && depth < 4) {
      const parts = u.ingredients.map((i) => {
        const v = resolveFoodDepth(i.foodId, userFoods, overridesByRef, depth + 1);
        if (v) for (const t of v.tags) tags.add(t);
        return v ? { profile: v.fodmap, weight: i.weight } : null;
      }).filter((x): x is { profile: FodmapProfile; weight: number | undefined } => !!x);
      fodmap = deriveDishProfile(parts);
    } else if (u.refId && REF_BY_ID.has(u.refId)) {
      const ref = REF_BY_ID.get(u.refId)!; fodmap = ref.fodmap; groupUnknown = ref.groupUnknown; for (const t of ref.tags) tags.add(t);
    }
  }
  const ref = u.refId ? REF_BY_ID.get(u.refId) ?? null : null;
  const untested = !worst(fodmap) && !(u.kind === 'dish' && u.ingredients.length);
  return {
    id: u.id, name: u.name, category: u.category, kind: u.kind, fodmap, overall: worst(fodmap),
    groupUnknown, polyolType: ref?.polyolType ?? null,
    servings: { low: ref?.lowServing ?? null, moderate: ref?.moderateServing ?? null, high: ref?.highServing ?? null },
    confidence: u.overrideFodmap ? 'user' : untested ? 'low' : ref?.confidence ?? 'user',
    conflictCount: ref?.conflictCount ?? 0, tags: [...tags], ingredients: u.ingredients, ref, user: u, favorite: u.favorite,
  };
}
function resolveFoodDepth(id: string, userFoods: Map<string, Food>, overridesByRef: Map<string, Food>, depth: number): FoodView | null {
  if (isRefKey(id)) { const ref = REF_BY_ID.get(stripRef(id)); return ref ? viewFromRef(ref, overridesByRef.get(ref.id) ?? null) : null; }
  const u = userFoods.get(id); return u ? viewFromUser(u, userFoods, overridesByRef, depth) : null;
}

/** Scan a packaged-food ingredient list for FODMAP keywords. Negations (rating low) suppress their parents. */
export function scanIngredientText(text: string): { keyword: string; group: string | null; rating: Rating; note: string | null }[] {
  const t = text.toLowerCase();
  const hits = KEYWORDS.filter((k) => t.includes(k.keyword));
  const lows = hits.filter((h) => h.rating === 'low');
  return hits.filter((h) => h.rating !== 'low' && !lows.some((l) => l.keyword.includes(h.keyword))).concat(lows);
}

export const RATING_STYLE: Record<Exclude<Rating, null> | 'unknown', string> = {
  high: 'bg-rose-100 text-rose-800 border-rose-200',
  moderate: 'bg-amber-100 text-amber-800 border-amber-200',
  low: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  unknown: 'bg-slate-100 text-slate-500 border-slate-200',
};
