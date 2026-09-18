import Fuse from 'fuse.js';
import { REFERENCE, refKey } from './fodmap';
import type { Food, FoodView } from '../types';

export interface SearchHit { id: string; name: string; sub: string; score: number; isRef: boolean; tier: 'user' | 'primary' | 'variant' }

const refFuse = new Fuse(REFERENCE.map((r) => ({ id: r.id, name: r.name, aliases: r.aliases, category: r.category, tier: r.tier })), {
  keys: [{ name: 'name', weight: 0.7 }, { name: 'aliases', weight: 0.3 }],
  threshold: 0.35, ignoreLocation: true, includeScore: true, minMatchCharLength: 2,
});

export function searchFoods(q: string, userFoods: Food[], limit = 12): SearchHit[] {
  const query = q.trim().toLowerCase();
  if (query.length < 2) return [];
  const userFuse = new Fuse(userFoods.filter((f) => f.source !== 'override'), {
    keys: [{ name: 'name', weight: 0.7 }, { name: 'aliases', weight: 0.3 }], threshold: 0.35, ignoreLocation: true, includeScore: true,
  });
  const overriddenRefs = new Set(userFoods.filter((f) => f.source === 'override' && f.refId).map((f) => f.refId!));
  const user: SearchHit[] = userFuse.search(query, { limit }).map((r) => ({
    id: r.item.id, name: r.item.name, sub: r.item.kind === 'dish' ? `dish · ${r.item.ingredients.length} ingredients` : r.item.source === 'freeText' ? 'your entry' : 'your food',
    score: (r.score ?? 1) - 0.15, isRef: false, tier: 'user',
  }));
  const ref: SearchHit[] = refFuse.search(query, { limit: limit * 2 }).map((r) => ({
    id: refKey(r.item.id), name: r.item.name, sub: r.item.category + (overriddenRefs.has(r.item.id) ? ' · overridden' : ''),
    score: (r.score ?? 1) + (r.item.tier === 'variant' ? 0.25 : 0), isRef: true, tier: r.item.tier,
  }));
  // exact-name match always first
  const all = [...user, ...ref].map((h) => ({ ...h, score: h.name === query ? -1 : h.score }));
  return all.sort((a, b) => a.score - b.score).slice(0, limit);
}

export function viewLabel(v: FoodView): string {
  return v.kind === 'dish' ? `${v.name} (dish)` : v.name;
}
