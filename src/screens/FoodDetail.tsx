import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FodmapPills, RatingPill } from '../components/FodmapPills';
import { DishForm } from '../components/AddFoodSheet';
import { Button, Card, Label } from '../components/ui';
import { useFoodResolver } from '../db/hooks';
import { clearOverrideProfile, deleteFood, foodFromFreeText, saveFood, setOverrideProfile, toggleFavorite } from '../db/repo';
import { EMPTY_PROFILE, isRefKey, scanIngredientText } from '../lib/fodmap';
import { searchFoods } from '../lib/search';
import { GROUPS, GROUP_LABEL, type FodmapProfile, type Rating } from '../types';
import tagsJson from '../../data/tags.json';

const TAG_LABEL = (tagsJson as { tags: Record<string, string> }).tags;
type Details = { conflicts: string[]; notes: string[]; sources: { family: string; url: string }[]; quantitative: Record<string, number | null> | null; sourceFamilies: string[] };

export default function FoodDetail() {
  const { id = '' } = useParams();
  const foodId = decodeURIComponent(id);
  const nav = useNavigate();
  const { foods, resolve, ready } = useFoodResolver();
  const view = resolve(foodId);
  const [details, setDetails] = useState<Details | null>(null);
  const [editing, setEditing] = useState(false);
  const [editProfile, setEditProfile] = useState<FodmapProfile>({ ...EMPTY_PROFILE });
  const [ingredientEdit, setIngredientEdit] = useState(false);
  const [scanText, setScanText] = useState('');
  const scan = useMemo(() => (scanText.trim() ? scanIngredientText(scanText) : []), [scanText]);

  useEffect(() => {
    if (view?.ref) import('../data/reference-details.json').then((m) => setDetails((m.default as Record<string, Details>)[view.ref!.id] ?? null));
  }, [view?.ref?.id]);
  useEffect(() => { if (view) setEditProfile({ ...view.fodmap }); }, [view?.id, view?.fodmap]);

  if (!ready) return null;
  if (!view) return <Card><p className="text-sm">Food not found.</p><Link to="/foods" className="text-teal-700 underline">Back</Link></Card>;

  const refId = view.ref?.id ?? null;
  const cycle = (r: Rating): Rating => (r === null ? 'low' : r === 'low' ? 'moderate' : r === 'moderate' ? 'high' : null);

  async function saveOverride() {
    if (isRefKey(view!.id) && refId) await setOverrideProfile(refId, editProfile);
    else if (view!.user) await saveFood({ ...view!.user, fodmap: editProfile, overrideFodmap: true });
    setEditing(false);
  }
  async function resetOverride() {
    if (isRefKey(view!.id) && refId) await clearOverrideProfile(refId);
    else if (view!.user) await saveFood({ ...view!.user, overrideFodmap: false });
    setEditing(false);
  }
  async function saveIngredients(name: string, parts: string[]) {
    const ingredients: { foodId: string }[] = [];
    for (const p of parts) {
      const best = searchFoods(p, foods, 1)[0];
      ingredients.push({ foodId: best && best.score < 0.15 && best.id !== view!.id ? best.id : (await foodFromFreeText(p)).id });
    }
    await saveFood({ ...view!.user!, name: name.trim().toLowerCase(), kind: 'dish', ingredients, source: 'user' });
    setIngredientEdit(false);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <button onClick={() => nav(-1)} className="text-slate-500">‹ back</button>
        <h1 className="flex-1 truncate text-lg font-semibold">{view.name}</h1>
        <button onClick={() => toggleFavorite(view.id)} className={`text-xl ${view.favorite ? 'text-amber-500' : 'text-slate-300'}`}>★</button>
      </div>

      <Card>
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-500">{view.category}{view.kind === 'dish' ? ' · dish' : ''}{view.polyolType ? ` · polyol: ${view.polyolType}` : ''}</span>
          <FodmapPills profile={view.fodmap} overall={view.overall} groupUnknown={view.groupUnknown} conflictCount={view.conflictCount} compact={false} />
        </div>
        <table className="mt-3 w-full text-sm">
          <tbody>
            {GROUPS.map((g) => (
              <tr key={g} className="border-t border-slate-100">
                <td className="py-1.5 text-slate-600">{GROUP_LABEL[g]}</td>
                <td className="py-1.5 text-right">
                  {editing ? (
                    <button onClick={() => setEditProfile({ ...editProfile, [g]: cycle(editProfile[g]) })}><RatingPill rating={editProfile[g] ?? 'unknown'} label={editProfile[g] ?? 'not set'} /></button>
                  ) : <RatingPill rating={view.fodmap[g] ?? 'unknown'} label={view.fodmap[g] ?? '–'} />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-2 flex gap-2">
          {editing ? (<><Button kind="ghost" onClick={() => setEditing(false)}>Cancel</Button><Button onClick={saveOverride} className="flex-1">Save my rating</Button></>)
            : (<><Button kind="ghost" onClick={() => setEditing(true)}>Override ratings</Button>{view.confidence === 'user' && <Button kind="ghost" onClick={resetOverride}>Reset to reference</Button>}</>)}
        </div>
        {view.confidence === 'user' && <p className="mt-1 text-xs text-teal-700">Using your override.</p>}
        {(view.servings.low || view.servings.high) && (
          <dl className="mt-3 space-y-1 text-xs text-slate-600">
            {view.servings.low && <div><dt className="inline font-semibold text-emerald-700">Low serve: </dt><dd className="inline">{view.servings.low}</dd></div>}
            {view.servings.moderate && <div><dt className="inline font-semibold text-amber-700">Moderate: </dt><dd className="inline">{view.servings.moderate}</dd></div>}
            {view.servings.high && <div><dt className="inline font-semibold text-rose-700">High: </dt><dd className="inline">{view.servings.high}</dd></div>}
          </dl>
        )}
        {view.tags.length > 0 && (
          <div className="mt-3"><Label>Other sensitivities</Label>
            <div className="flex flex-wrap gap-1">{view.tags.map((t) => <span key={t} className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700">{TAG_LABEL[t] ?? t}</span>)}</div>
          </div>
        )}
      </Card>

      {view.user && view.user.source !== 'override' && (
        <Card>
          <div className="flex items-center justify-between"><Label>Ingredients</Label>
            {!ingredientEdit && <button className="text-xs font-medium text-teal-700" onClick={() => setIngredientEdit(true)}>{view.ingredients.length ? 'edit' : '+ add ingredients'}</button>}</div>
          {ingredientEdit ? (
            <DishForm initialName={view.name} initialParts={view.ingredients.map((i) => resolve(i.foodId)?.name ?? '?')} onCancel={() => setIngredientEdit(false)} onSave={saveIngredients} />
          ) : view.ingredients.length ? (
            <ul className="divide-y divide-slate-100">
              {view.ingredients.map((i) => { const iv = resolve(i.foodId); return iv ? (
                <li key={i.foodId}><Link to={`/foods/${encodeURIComponent(iv.id)}`} className="flex items-center justify-between py-1.5 text-sm"><span>{iv.name}</span><FodmapPills profile={iv.fodmap} overall={iv.overall} /></Link></li>
              ) : null; })}
            </ul>
          ) : <p className="text-xs text-slate-500">No ingredients yet. The analysis can only blame this food as a whole until you add them.</p>}
          <div className="mt-3 flex justify-end"><Button kind="danger" onClick={async () => { await deleteFood(view.user!.id); nav('/foods'); }}>Delete food</Button></div>
        </Card>
      )}

      <Card>
        <Label>Scan a label</Label>
        <textarea value={scanText} onChange={(e) => setScanText(e.target.value)} rows={2} placeholder="Paste an ingredient list to flag FODMAP keywords" className="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-sm" />
        {scan.length > 0 && (
          <ul className="mt-2 space-y-1">{scan.map((s) => (
            <li key={s.keyword} className="flex items-start gap-2 text-xs"><RatingPill rating={s.rating ?? 'unknown'} label={`${s.keyword}${s.group ? ` · ${s.group}` : ''}`} small />{s.note && <span className="text-slate-500">{s.note}</span>}</li>
          ))}</ul>
        )}
      </Card>

      {details && (
        <Card>
          <Label>Sources · confidence {view.ref?.confidence} · {details.sourceFamilies.join(', ')}</Label>
          {details.conflicts.length > 0 && (
            <div className="mb-2 rounded-lg bg-amber-50 p-2 text-xs text-amber-900"><b>Sources disagree:</b><ul className="mt-1 list-disc pl-4">{details.conflicts.map((c, i) => <li key={i}>{c}</li>)}</ul></div>
          )}
          {details.quantitative && (
            <p className="mb-2 text-xs text-slate-600">Measured per 100 g: {Object.entries(details.quantitative).filter(([k, v]) => v != null && k !== 'servingG').map(([k, v]) => `${k.replace('_g_per_100g', '')} ${v} g`).join(', ')}</p>
          )}
          <ul className="space-y-1 text-xs text-slate-600">{details.notes.map((n, i) => <li key={i}>{n}</li>)}</ul>
          <ul className="mt-2 space-y-0.5 text-xs">{details.sources.map((s, i) => <li key={i}><a href={s.url} target="_blank" rel="noreferrer" className="break-all text-teal-700 underline">{s.family}: {s.url.replace(/^https?:\/\//, '').slice(0, 60)}</a></li>)}</ul>
        </Card>
      )}
      {!view.ref && !view.user?.overrideFodmap && view.kind !== 'dish' && (
        <p className="px-1 text-xs text-slate-500">This food isn't in the reference table. Override the ratings above if you know them, or add ingredients so they can be derived.</p>
      )}
    </div>
  );
}
