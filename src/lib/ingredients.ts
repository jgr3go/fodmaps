/** Turn a packaged-food ingredient statement into a list of ingredient names, and match them to foods. */
import { newFood, saveFood } from '../db/repo';
import { searchFoods } from './search';
import type { Food, FoodView, Ingredient } from '../types';

const CONTAINS = /contains\s+(less than\s+)?\d+(\.\d+)?\s?%\s*(or less\s*)?(of)?(\s+the following)?\s*:?/gi;
const NOISE = /\b(ingredients?|and\/or|may contain|for (color|freshness)|as a preservative|to (preserve|protect|maintain) (color|freshness|quality)|added|natural|artificial|organic|enriched|bleached|unbleached|modified|cultured|pasteurized|dried|dehydrated|powdered|concentrate[ds]?|extract|solids|vitamin [a-e]\d*|\*)\b/gi;
const PCT = /\(?\d+(\.\d+)?\s?%\)?/g;

/**
 * "Enriched flour (wheat flour, niacin), water, contains 2% or less of: salt, garlic powder*." ->
 * ["enriched flour", "wheat flour", "niacin", "water", "salt", "garlic powder"]
 * Parenthesised sub-ingredients are kept as separate items right after their parent.
 */
export function parseIngredientText(text: string): string[] {
  // newlines count as separators (pasted lists), "and/or" is dropped, a bare " and " splits ("milk and cream")
  let t = text.replace(CONTAINS, ', ').replace(/\band\/or\b/gi, ' ').replace(/\r?\n/g, ',').replace(PCT, ' ').replace(/[.:;]/g, ',').replace(/\s+and\s+/gi, ', ');
  t = t.replace(/\(([^()]*)\)|\[([^\]]*)\]/g, (_m, a, b) => `, ${a ?? b}, `);
  const out: string[] = [];
  for (let raw of t.split(',')) {
    raw = raw.replace(NOISE, ' ').replace(/[^a-z0-9' \-]/gi, ' ').replace(/\s+/g, ' ').trim().toLowerCase();
    if (raw.length < 2 || /^\d+$/.test(raw)) continue;
    if (!out.includes(raw)) out.push(raw);
  }
  return out;
}

export interface MatchedIngredient { name: string; foodId: string | null; view: FoodView | null; score: number }

export function matchIngredients(names: string[], foods: Food[], resolve: (id: string) => FoodView | null, excludeId?: string): MatchedIngredient[] {
  const pool = excludeId ? foods.filter((f) => f.id !== excludeId) : foods;
  return names.map((name) => {
    const hit = searchFoods(name, pool, 1)[0];
    if (hit && hit.score <= 0.2) return { name, foodId: hit.id, view: resolve(hit.id), score: hit.score };
    return { name, foodId: null, view: null, score: 1 };
  });
}

/** Monash label rule: these count fully wherever they sit in the list; everything past the first three is weighted down. */
const ALWAYS_FULL = /\b(garlic|onion|shallot|leek|inulin|chicory|fos|fructo-?oligosaccharides?|gos|galacto-?oligosaccharides?|honey|agave|high[- ]fructose corn syrup|hfcs|sorbitol|mannitol|xylitol|maltitol|isomalt|polydextrose)\b/i;
export function positionWeight(name: string, index: number): number {
  if (ALWAYS_FULL.test(name)) return 1;
  return index < 3 ? 1 : 0.4;
}

/** Save the list as the food's ingredients. Unmatched names become free-text foods so they are still counted. */
export async function saveAsIngredients(food: Food, items: MatchedIngredient[]): Promise<Food> {
  const ingredients: Ingredient[] = [];
  for (const [i, it] of items.entries()) {
    let id = it.foodId;
    if (!id) { const f = await saveFood(newFood({ name: it.name, category: 'other', source: 'freeText' })); id = f.id; }
    if (id === food.id || ingredients.some((x) => x.foodId === id)) continue;
    ingredients.push({ foodId: id, weight: positionWeight(it.name, i) });
  }
  return saveFood({ ...food, kind: 'dish', ingredients, overrideFodmap: false, source: food.source === 'freeText' ? 'user' : food.source });
}
