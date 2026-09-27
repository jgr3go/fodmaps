import { useMemo, useState } from 'react';
import { Button, Label } from './ui';
import { FodmapPills } from './FodmapPills';
import { useFoodResolver } from '../db/hooks';
import { foodFromFreeText } from '../db/repo';
import { deriveDishProfile } from '../lib/fodmap';
import { searchFoods } from '../lib/search';
import { PORTION_WEIGHT, type Ingredient, type Portion } from '../types';

export interface MealItem { foodId: string | null; name: string; weight: number }
const portionOf = (w: number): Portion => (w <= 0.5 ? 'S' : w >= 1.5 ? 'L' : 'M');

/**
 * Build or edit a meal: name, ingredient search with the same autocomplete and FODMAP pills as the add sheet, and an
 * S/M/L size on every ingredient. Unmatched names are created as foods on save so they still count.
 */
export function MealBuilder({ initialName = '', initialItems = [], excludeId, saveLabel = 'Save meal', onCancel, onSave }: {
  initialName?: string; initialItems?: MealItem[]; excludeId?: string; saveLabel?: string; onCancel: () => void;
  onSave: (name: string, ingredients: Ingredient[]) => void | Promise<void>;
}) {
  const { foods, resolve } = useFoodResolver();
  const [name, setName] = useState(initialName);
  const [items, setItems] = useState<MealItem[]>(initialItems);
  const [q, setQ] = useState('');
  const [busy, setBusy] = useState(false);
  const pool = useMemo(() => foods.filter((f) => f.id !== excludeId), [foods, excludeId]);
  const hits = useMemo(() => searchFoods(q, pool, 8), [q, pool]);
  const preview = useMemo(() => deriveDishProfile(items.map((it) => ({ profile: (it.foodId ? resolve(it.foodId)?.fodmap : undefined) ?? { fructans: null, gos: null, lactose: null, fructose: null, polyols: null }, weight: it.weight }))), [items, resolve]);

  const add = (foodId: string | null, label: string) => {
    if (items.some((it) => (foodId ? it.foodId === foodId : it.name === label))) { setQ(''); return; }
    setItems([...items, { foodId, name: label, weight: 1 }]); setQ('');
  };
  async function save() {
    setBusy(true);
    try {
      const ingredients: Ingredient[] = [];
      for (const it of items) {
        const id = it.foodId ?? (await foodFromFreeText(it.name)).id;
        if (!ingredients.some((x) => x.foodId === id)) ingredients.push({ foodId: id, weight: it.weight });
      }
      await onSave(name.trim().toLowerCase(), ingredients);
    } finally { setBusy(false); }
  }

  return (
    <div>
      <Label>Meal name</Label>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. usual breakfast, chicken tikka" className="w-full rounded-xl border border-slate-300 px-3 py-2 text-base" />
      <div className="mt-3 flex items-center justify-between"><Label>Ingredients</Label>{items.length > 0 && <FodmapPills profile={preview} />}</div>
      {items.length === 0 && <p className="text-xs text-slate-400">Add what's in it. The meal's rating is derived from its ingredients and their sizes.</p>}
      <ul className="divide-y divide-slate-100">
        {items.map((it, i) => { const v = it.foodId ? resolve(it.foodId) : null; return (
          <li key={i} className="flex items-center gap-2 py-1.5">
            <span className="min-w-0 flex-1 truncate text-sm">{it.name}{!v && <span className="ml-1 text-[10px] text-slate-400">new</span>}</span>
            {v && <FodmapPills profile={v.fodmap} overall={v.overall} />}
            <span className="flex gap-0.5">{(['S', 'M', 'L'] as Portion[]).map((p) => (
              <button key={p} onClick={() => setItems(items.map((x, j) => (j === i ? { ...x, weight: PORTION_WEIGHT[p] } : x)))} className={`h-6 w-6 rounded-full border text-[10px] font-semibold ${portionOf(it.weight) === p ? 'border-teal-700 bg-teal-700 text-white' : 'border-slate-300 text-slate-500'}`}>{p}</button>
            ))}</span>
            <button className="px-1 text-slate-400" onClick={() => setItems(items.filter((_, j) => j !== i))}>✕</button>
          </li>
        ); })}
      </ul>
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search an ingredient to add" className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
        onKeyDown={(e) => { if (e.key === 'Enter' && q.trim()) { hits[0] && hits[0].score < 0 ? add(hits[0].id, hits[0].name) : add(null, q.trim().toLowerCase()); } }} />
      {q.trim().length >= 2 && (
        <ul className="mt-1 divide-y divide-slate-100">
          {hits.map((h) => { const v = resolve(h.id); return (
            <li key={h.id}><button onClick={() => add(h.id, h.name)} className="flex w-full items-center justify-between gap-2 py-1.5 text-left">
              <span><span className="text-sm">{h.name}</span><span className="ml-2 text-xs text-slate-400">{h.sub}</span></span>
              {v && <FodmapPills profile={v.fodmap} overall={v.overall} groupUnknown={v.groupUnknown} conflictCount={v.conflictCount} />}
            </button></li>
          ); })}
          <li className="pt-1"><Button kind="ghost" className="w-full" onClick={() => add(null, q.trim().toLowerCase())}>Add "{q.trim()}" as typed (untested)</Button></li>
        </ul>
      )}
      <p className="mt-2 text-[11px] text-slate-500">S steps an ingredient's rating down one level, L steps it up. When you log the meal you'll also pick a size for the whole meal.</p>
      <div className="mt-3 flex gap-2">
        <Button kind="ghost" onClick={onCancel}>Back</Button>
        <Button className="flex-1" disabled={busy || !name.trim() || !items.length} onClick={save}>{saveLabel}</Button>
      </div>
    </div>
  );
}
/** Helper for the FoodDetail editor: existing ingredients -> builder items. */
export function itemsFromIngredients(ingredients: Ingredient[], resolve: (id: string) => { name: string } | null): MealItem[] {
  return ingredients.map((i) => ({ foodId: i.foodId, name: resolve(i.foodId)?.name ?? '?', weight: i.weight ?? 1 }));
}
