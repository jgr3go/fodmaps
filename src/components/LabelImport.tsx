import { useMemo, useState } from 'react';
import { Button, Label } from './ui';
import { FodmapPills, RatingPill } from './FodmapPills';
import { useFoodResolver } from '../db/hooks';
import { saveFood } from '../db/repo';
import { scanIngredientText } from '../lib/fodmap';
import { matchIngredients, parseIngredientText, positionWeight, saveAsIngredients, type MatchedIngredient } from '../lib/ingredients';
import { readLabelPhoto } from '../lib/label';
import type { Food } from '../types';

/**
 * Get a packaged food's ingredients in: photograph the label (server reads it) or paste the list (parsed locally).
 * Either way the result is an editable, matched list that saves as the food's ingredients.
 */
export function LabelImport({ food, onSaved }: { food: Food; onSaved?: () => void }) {
  const { foods, resolve } = useFoodResolver();
  const [mode, setMode] = useState<'idle' | 'paste' | 'review'>('idle');
  const [text, setText] = useState('');
  const [items, setItems] = useState<MatchedIngredient[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [productName, setProductName] = useState<string | null>(null);
  const warnings = useMemo(() => scanIngredientText(items.map((i) => i.name).join(', ')).filter((w) => w.rating !== 'low'), [items]);

  const review = (names: string[]) => { setItems(matchIngredients(names, foods, resolve, food.id)); setMode('review'); };

  async function photo(file: File) {
    setBusy(true); setStatus('Reading the label…');
    try {
      const r = await readLabelPhoto(file);
      if (!r.ingredients.length) { setStatus(`No ingredient list found${r.productName ? ` on "${r.productName}"` : ''}. Try a closer, straighter shot of the ingredients panel.`); }
      else { setProductName(r.productName); setStatus(null); review(r.ingredients); }
    } catch (e) { setStatus(`Failed: ${(e as Error).message}`); }
    finally { setBusy(false); }
  }
  async function save() {
    setBusy(true);
    try {
      await saveAsIngredients(food, items);
      if (productName && food.source === 'freeText' && food.name !== productName.toLowerCase()) await saveFood({ ...food, notes: `Label: ${productName}` });
      setMode('idle'); setItems([]); setText(''); setStatus(`Saved ${items.length} ingredients.`); onSaved?.();
    } catch (e) { setStatus(`Failed: ${(e as Error).message}`); }
    finally { setBusy(false); }
  }
  const remove = (i: number) => setItems(items.filter((_, j) => j !== i));
  const rename = (i: number, name: string) => setItems(items.map((it, j) => (j === i ? matchIngredients([name], foods, resolve, food.id)[0] : it)));

  return (
    <div className="mt-3 border-t border-slate-100 pt-3">
      <Label>From the package</Label>
      {mode === 'idle' && (
        <div className="flex flex-wrap gap-2">
          <label className={`rounded-xl bg-teal-700 px-3 py-2 text-sm font-medium text-white ${busy ? 'opacity-40' : ''}`}>
            📷 Photo of label
            <input type="file" accept="image/*" capture="environment" className="hidden" disabled={busy} onChange={(e) => { const f = e.target.files?.[0]; if (f) photo(f); e.target.value = ''; }} />
          </label>
          <Button kind="ghost" onClick={() => setMode('paste')}>Paste ingredient list</Button>
        </div>
      )}
      {mode === 'paste' && (
        <div>
          <textarea autoFocus value={text} onChange={(e) => setText(e.target.value)} rows={4} placeholder="Paste the ingredient statement, e.g. Enriched flour (wheat flour, niacin), water, salt, garlic powder…" className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" />
          <div className="mt-2 flex gap-2"><Button kind="ghost" onClick={() => setMode('idle')}>Cancel</Button><Button className="flex-1" disabled={text.trim().length < 3} onClick={() => review(parseIngredientText(text))}>Parse ingredients</Button></div>
        </div>
      )}
      {mode === 'review' && (
        <div>
          {productName && <p className="mb-1 text-xs text-slate-500">Label read as: <b>{productName}</b></p>}
          {warnings.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-1">{warnings.map((w) => <RatingPill key={w.keyword} rating={w.rating ?? 'unknown'} label={`${w.keyword}${w.group ? ` · ${w.group}` : ''}`} small />)}</div>
          )}
          <ul className="divide-y divide-slate-100">
            {items.map((it, i) => (
              <li key={i} className="flex items-center gap-2 py-1.5">
                <span className={`w-5 text-right text-[10px] ${positionWeight(it.name, i) < 1 ? 'text-slate-300' : 'text-slate-500'}`}>{i + 1}</span>
                <input value={it.name} onChange={(e) => rename(i, e.target.value)} className="min-w-0 flex-1 rounded-lg border border-transparent bg-transparent px-1 text-sm focus:border-slate-300" />
                {it.view ? <FodmapPills profile={it.view.fodmap} overall={it.view.overall} /> : <span className="rounded-full bg-slate-100 px-1.5 text-[10px] text-slate-500">new</span>}
                <button onClick={() => remove(i)} className="px-1 text-slate-400">✕</button>
              </li>
            ))}
          </ul>
          <p className="mt-1 text-[11px] text-slate-500">Matched ingredients show their rating; "new" ones are created and can be rated later. Items after the third are weighted down, except garlic, onion, inulin and sweeteners, which count fully wherever they appear.</p>
          <div className="mt-2 flex gap-2"><Button kind="ghost" onClick={() => setMode('idle')}>Cancel</Button><Button className="flex-1" disabled={busy || !items.length} onClick={save}>Save {items.length} as ingredients</Button></div>
        </div>
      )}
      {status && <p className={`mt-2 text-xs ${status.startsWith('Failed') || status.startsWith('No ') ? 'text-rose-700' : 'text-teal-700'}`}>{busy && <span className="mr-1 inline-block h-2 w-2 animate-pulse rounded-full bg-teal-600" />}{status}</p>}
    </div>
  );
}
