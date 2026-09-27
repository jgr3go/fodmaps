import { useEffect, useMemo, useState } from 'react';
import { Button, Chip, Label, Sheet } from './ui';
import { FodmapPills } from './FodmapPills';
import { searchFoods, type SearchHit } from '../lib/search';
import { MealBuilder, type MealItem } from './MealBuilder';
import type { Ingredient } from '../types';
import { useFoodResolver } from '../db/hooks';
import { addEntry, foodFromFreeText, newFood, recentFoodIds, saveFood } from '../db/repo';
import { useLiveQuery } from 'dexie-react-hooks';
import { defaultSlotTime } from '../lib/dates';
import { applyModifiers, applyTags, decompose } from '../lib/modifiers';
import { isRefKey, stripRef } from '../lib/fodmap';
import { SLOT_LABEL, type Portion, type Slot } from '../types';

export function AddFoodSheet({ open, onClose, date, slot }: { open: boolean; onClose: () => void; date: string; slot: Slot }) {
  const { foods, resolve } = useFoodResolver();
  const [q, setQ] = useState('');
  const [portion, setPortion] = useState<Portion>('M');
  const [time, setTime] = useState<string>('');
  const [withTime, setWithTime] = useState(false);
  const [ingredientMode, setIngredientMode] = useState(false);
  const [pending, setPending] = useState<{ name: string; items: MealItem[] } | null>(null);
  const recents = useLiveQuery(() => recentFoodIds(24), [], [] as string[]);
  const favorites = useMemo(() => foods.filter((f) => f.favorite).map((f) => (f.source === 'override' && f.refId ? `ref:${f.refId}` : f.id)), [foods]);

  useEffect(() => { if (open) { setQ(''); setPortion('M'); setWithTime(false); setTime(defaultSlotTime(slot)); setPending(null); setIngredientMode(false); } }, [open, slot]);

  const hits = useMemo(() => searchFoods(q, foods), [q, foods]);
  const isCommaList = q.includes(',');
  // "lactaid cream cheese" -> base "cream cheese" + lactose-free. Offered when the base matches well.
  const derived = useMemo(() => {
    if (isCommaList || q.trim().length < 3) return null;
    const d = decompose(q); if (!d.changed || !d.base) return null;
    if (hits[0] && hits[0].score < 0.05) return null; // the full name already matches a known food (e.g. "gluten-free bread")
    const hit = searchFoods(d.base, foods, 1)[0]; if (!hit || hit.score > 0.2) return null;
    const v = resolve(hit.id); if (!v) return null;
    const fodmap = applyModifiers(v.fodmap, d.modifiers);
    return { base: v, fodmap, tags: applyTags(v.tags, d.modifiers), modifiers: d.modifiers, exactBase: hits.some((h) => h.id === hit.id && h.score < 0) };
  }, [q, foods, isCommaList, hits, resolve]);

  async function addDerived() {
    if (!derived) return;
    const base = derived.base;
    const f = await saveFood(newFood({
      name: q.trim().toLowerCase(), category: base.category, kind: 'ingredient',
      refId: isRefKey(base.id) ? stripRef(base.id) : null,
      ingredients: isRefKey(base.id) ? [] : [{ foodId: base.id }],
      fodmap: derived.fodmap, overrideFodmap: true, tags: derived.tags, source: 'user',
      notes: `Based on ${base.name}${derived.modifiers.length ? ` (${derived.modifiers.map((m) => m.label).join(', ')})` : ''}. ${derived.modifiers.map((m) => m.note).join(' ')}`.trim(),
    }));
    await commit(f.id);
  }

  async function commit(foodId: string) {
    await addEntry({ date, slot, foodId, portion, time: withTime ? time : null });
    onClose();
  }
  async function addFreeText() {
    // Comma-separated text = ad-hoc dish made of its parts. Otherwise a plain free-text food, still counted.
    if (isCommaList) {
      const parts = q.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
      const items: MealItem[] = parts.map((p) => { const h = searchFoods(p, foods, 1)[0]; return h && h.score < 0.15 ? { foodId: h.id, name: h.name, weight: 1 } : { foodId: null, name: p, weight: 1 }; });
      setPending({ name: parts.join(', ').slice(0, 60), items }); setIngredientMode(true); return;
    }
    const f = await foodFromFreeText(q);
    await commit(f.id);
  }
  async function saveDish(name: string, ingredients: Ingredient[]) {
    const dish = await saveFood(newFood({ name, kind: 'dish', ingredients, category: 'other', favorite: true }));
    await commit(dish.id);
  }

  const quick = (ids: string[], title: string) => {
    const views = ids.map((id) => resolve(id)).filter((v): v is NonNullable<typeof v> => !!v);
    if (!views.length) return null;
    return (
      <div className="mt-3">
        <Label>{title}</Label>
        <div className="flex flex-wrap gap-1.5">
          {views.map((v) => (
            <button key={v.id} onClick={() => commit(v.id)} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm">{v.name}</button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Sheet open={open} onClose={onClose} title={`Add to ${SLOT_LABEL[slot]}`} anchor="top">
      {ingredientMode ? (
        <MealBuilder initialName={pending?.name ?? ''} initialItems={pending?.items ?? []} saveLabel="Save meal and add" onCancel={() => { setIngredientMode(false); setPending(null); }} onSave={saveDish} />
      ) : (
        <>
          <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search food, or type ingredients separated by commas"
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-base" onKeyDown={(e) => { if (e.key === 'Enter' && q.trim()) { hits[0] && !isCommaList && hits[0].score < 0 ? commit(hits[0].id) : derived ? addDerived() : addFreeText(); } }} />
          <div className="mt-2 flex items-center gap-2">
            <Label>Portion</Label>
            {(['S', 'M', 'L'] as Portion[]).map((p) => <Chip key={p} active={portion === p} onClick={() => setPortion(p)}>{p}</Chip>)}
            <span className="flex-1" />
            <Chip active={withTime} onClick={() => setWithTime(!withTime)}>time</Chip>
            {withTime && <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="rounded-lg border border-slate-300 px-2 py-0.5 text-sm" />}
          </div>
          {derived && !derived.exactBase && (
            <button onClick={addDerived} className="mt-3 flex w-full items-center justify-between gap-2 rounded-xl border border-teal-200 bg-teal-50 px-3 py-2 text-left">
              <span className="min-w-0"><span className="text-sm">{q.trim().toLowerCase()}</span>
                <span className="block text-[11px] text-teal-800">as <b>{derived.base.name}</b>{derived.modifiers.length ? `, ${derived.modifiers.map((m) => m.label).join(', ')}` : ''}</span></span>
              <FodmapPills profile={derived.fodmap} />
            </button>
          )}
          {q.trim().length >= 2 && (
            <ul className="mt-3 divide-y divide-slate-100">
              {hits.map((h: SearchHit) => { const v = resolve(h.id); return (
                <li key={h.id}>
                  <button onClick={() => commit(h.id)} className="flex w-full items-center justify-between gap-2 py-2 text-left">
                    <span><span className="text-sm">{h.name}</span><span className="ml-2 text-xs text-slate-400">{h.sub}</span></span>
                    {v && <FodmapPills profile={v.fodmap} overall={v.overall} groupUnknown={v.groupUnknown} conflictCount={v.conflictCount} />}
                  </button>
                </li>
              ); })}
              <li className="pt-2">
                <Button kind="ghost" className="w-full" onClick={addFreeText}>
                  {isCommaList ? `Create dish from ${q.split(',').filter((s) => s.trim()).length} ingredients` : `Add "${q.trim()}" as typed (untested)`}
                </Button>
              </li>
            </ul>
          )}
          {q.trim().length < 2 && (<>
            {quick(favorites, 'Favorites')}{quick(recents ?? [], 'Recent')}
            <button onClick={() => { setPending(null); setIngredientMode(true); }} className="mt-4 w-full rounded-xl border border-dashed border-teal-300 px-3 py-2 text-sm text-teal-800">+ New meal (several ingredients, saved for reuse)</button>
          </>)}
        </>
      )}
    </Sheet>
  );
}
