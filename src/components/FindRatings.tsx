import { useEffect, useMemo, useState } from 'react';
import { Button, Card, Label } from './ui';
import { FodmapPills, RatingPill } from './FodmapPills';
import { useFoodResolver } from '../db/hooks';
import { saveFood } from '../db/repo';
import { scanIngredientText, isRefKey, stripRef } from '../lib/fodmap';
import { googleUrl, lookupFood, monashUrl, type LookupResult } from '../lib/lookup';
import { applyModifiers, applyTags, decompose } from '../lib/modifiers';
import { searchFoods } from '../lib/search';
import type { Food, FodmapProfile, FoodView } from '../types';

/** Ways to rate a food the reference table doesn't know: base it on a known food, ask Claude, search the web, scan a label, or mark it low. */
export function FindRatings({ view }: { view: FoodView }) {
  const { foods, resolve } = useFoodResolver();
  const user = view.user!;
  const [baseQ, setBaseQ] = useState('');
  const [look, setLook] = useState<LookupResult | null>(null);
  const [looking, setLooking] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const busy = !!looking && !looking.startsWith('Failed');
  useEffect(() => {
    if (!busy) return; setElapsed(0);
    const t = setInterval(() => setElapsed((e) => e + 1), 1000); return () => clearInterval(t);
  }, [busy]);
  const [scanText, setScanText] = useState('');
  const [showScan, setShowScan] = useState(false);
  const scan = useMemo(() => (scanText.trim() ? scanIngredientText(scanText) : []), [scanText]);
  const decomposed = useMemo(() => decompose(view.name), [view.name]);
  const baseHits = useMemo(() => (baseQ.trim().length >= 2 ? searchFoods(baseQ, foods.filter((f) => f.id !== user.id), 6) : []), [baseQ, foods, user.id]);
  const suggested = useMemo(() => {
    if (!decomposed.changed) return null;
    const h = searchFoods(decomposed.base, foods.filter((f) => f.id !== user.id), 1)[0];
    return h && h.score <= 0.25 ? resolve(h.id) : null;
  }, [decomposed, foods, resolve, user.id]);

  async function baseOn(base: FoodView) {
    const mods = decomposed.modifiers;
    const patch: Partial<Food> = {
      refId: isRefKey(base.id) ? stripRef(base.id) : null,
      ingredients: isRefKey(base.id) ? [] : [{ foodId: base.id }],
      kind: 'ingredient', category: base.category,
      fodmap: applyModifiers(base.fodmap, mods), overrideFodmap: mods.length > 0, tags: applyTags(base.tags, mods),
      notes: `Based on ${base.name}${mods.length ? ` (${mods.map((m) => m.label).join(', ')}). ${mods.map((m) => m.note).join(' ')}` : '.'}`,
    };
    await saveFood({ ...user, ...patch, source: 'user' }); setBaseQ('');
  }
  async function ask() {
    setLooking('Searching the web and asking Claude. This usually takes 20 to 40 seconds.'); setLook(null);
    try { setLook(await lookupFood(view.name)); setLooking(null); } catch (e) { setLooking(`Failed: ${(e as Error).message}`); }
  }
  async function applyLookup() {
    if (!look) return;
    const fodmap: FodmapProfile = { fructans: look.fructans, gos: look.gos, lactose: look.lactose, fructose: look.fructose, polyols: look.polyols };
    await saveFood({ ...user, fodmap, overrideFodmap: true, tags: Array.from(new Set([...user.tags, ...look.tags])), source: 'user',
      notes: `${look.summary} (Claude lookup, confidence ${look.confidence}${look.sources.length ? `; ${look.sources.join(' ')}` : ''})${look.lowServing ? ` Low serve: ${look.lowServing}.` : ''}` });
    setLook(null);
  }
  const markLow = () => saveFood({ ...user, fodmap: { fructans: 'low', gos: 'low', lactose: 'low', fructose: 'low', polyols: 'low' }, overrideFodmap: true, source: 'user' });

  return (
    <Card className="border-amber-200">
      <Label>Find ratings for this food</Label>
      {suggested && (
        <button onClick={() => baseOn(suggested)} className="mb-2 flex w-full items-center justify-between gap-2 rounded-xl border border-teal-200 bg-teal-50 px-3 py-2 text-left">
          <span className="text-sm">Looks like <b>{suggested.name}</b>{decomposed.modifiers.length ? `, ${decomposed.modifiers.map((m) => m.label).join(', ')}` : ''}. Use that?</span>
          <FodmapPills profile={applyModifiers(suggested.fodmap, decomposed.modifiers)} />
        </button>
      )}
      <div className="flex flex-wrap gap-2">
        <Button kind="ghost" onClick={ask} disabled={busy}>{busy ? `Asking… ${elapsed}s` : 'Ask Claude'}</Button>
        <a href={googleUrl(view.name)} target="_blank" rel="noreferrer" className="rounded-xl bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700">Google</a>
        <a href={monashUrl(view.name)} target="_blank" rel="noreferrer" className="rounded-xl bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700">Monash blog</a>
        <Button kind="ghost" onClick={markLow}>Mark all low</Button>
        <Button kind="ghost" onClick={() => setShowScan(!showScan)}>Scan a label</Button>
      </div>
      {looking && <p className={`mt-2 text-xs ${busy ? 'text-teal-700' : 'text-rose-700'}`}>{busy && <span className="mr-1 inline-block h-2 w-2 animate-pulse rounded-full bg-teal-600" />}{looking}</p>}
      {look && (
        <div className="mt-2 rounded-xl bg-slate-50 p-3">
          <div className="flex items-center justify-between"><span className="text-xs font-semibold">Claude says · confidence {look.confidence}{look.cached ? ' · cached' : ''}</span><FodmapPills profile={look} /></div>
          <p className="mt-1 text-sm">{look.summary}</p>
          {(look.lowServing || look.highServing) && <p className="mt-1 text-xs text-slate-600">{look.lowServing ? `Low serve: ${look.lowServing}. ` : ''}{look.highServing ? `High: ${look.highServing}.` : ''}</p>}
          {look.sources.length > 0 && <ul className="mt-1 space-y-0.5 text-[11px]">{look.sources.map((u) => <li key={u}><a href={u} target="_blank" rel="noreferrer" className="break-all text-teal-700 underline">{u.replace(/^https?:\/\//, '').slice(0, 70)}</a></li>)}</ul>}
          <div className="mt-2 flex gap-2"><Button onClick={applyLookup} className="flex-1">Use these ratings</Button><Button kind="ghost" onClick={() => setLook(null)}>Dismiss</Button></div>
        </div>
      )}
      <div className="mt-3">
        <Label>Or base it on a known food</Label>
        <input value={baseQ} onChange={(e) => setBaseQ(e.target.value)} placeholder="e.g. cream cheese" className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" />
        {baseHits.length > 0 && (
          <ul className="mt-1 divide-y divide-slate-100">{baseHits.map((h) => { const v = resolve(h.id); return v ? (
            <li key={h.id}><button onClick={() => baseOn(v)} className="flex w-full items-center justify-between py-1.5 text-left text-sm"><span>{v.name}<span className="ml-1 text-xs text-slate-400">{h.sub}</span></span><FodmapPills profile={v.fodmap} overall={v.overall} /></button></li>
          ) : null; })}</ul>
        )}
        {decomposed.modifiers.length > 0 && <p className="mt-1 text-[11px] text-slate-500">Detected: {decomposed.modifiers.map((m) => m.label).join(', ')}. Those adjustments are applied to whatever you pick.</p>}
      </div>
      {showScan && (
        <div className="mt-3">
          <textarea value={scanText} onChange={(e) => setScanText(e.target.value)} rows={2} placeholder="Paste the ingredient list from the package" className="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-sm" />
          {scan.length > 0 && <ul className="mt-2 space-y-1">{scan.map((s) => <li key={s.keyword} className="flex items-start gap-2 text-xs"><RatingPill rating={s.rating ?? 'unknown'} label={`${s.keyword}${s.group ? ` · ${s.group}` : ''}`} small />{s.note && <span className="text-slate-500">{s.note}</span>}</li>)}</ul>}
        </div>
      )}
    </Card>
  );
}
