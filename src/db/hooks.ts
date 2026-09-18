import { useLiveQuery } from 'dexie-react-hooks';
import { useMemo } from 'react';
import { db } from './schema';
import { resolveFood } from '../lib/fodmap';
import type { Food, FoodView } from '../types';

/** Live map of user foods and a resolver bound to it. */
export function useFoodResolver() {
  const foods = useLiveQuery(() => db.foods.where('deleted').equals(0).toArray(), [], undefined as Food[] | undefined);
  return useMemo(() => {
    const list = foods ?? [];
    const byId = new Map(list.map((f) => [f.id, f]));
    const overrides = new Map(list.filter((f) => f.source === 'override' && f.refId).map((f) => [f.refId!, f]));
    const resolve = (id: string): FoodView | null => resolveFood(id, byId, overrides);
    return { foods: list, byId, overrides, resolve, ready: foods !== undefined };
  }, [foods]);
}
