import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FodmapPills } from '../components/FodmapPills';
import { Card, Chip, Empty, Label } from '../components/ui';
import { useFoodResolver } from '../db/hooks';
import { REFERENCE, refKey } from '../lib/fodmap';
import { searchFoods } from '../lib/search';
import type { Category } from '../types';

const CATS: Category[] = ['vegetable', 'fruit', 'grain', 'legume', 'nut-seed', 'dairy', 'protein', 'sweetener', 'beverage', 'alcohol', 'condiment', 'processed', 'herb-spice', 'additive', 'other'];

export default function Foods() {
  const { foods, resolve, overrides } = useFoodResolver();
  const [q, setQ] = useState('');
  const [tab, setTab] = useState<'mine' | 'reference'>('mine');
  const [cat, setCat] = useState<Category | null>(null);

  const mine = useMemo(() => foods.filter((f) => f.source !== 'override').sort((a, b) => a.name.localeCompare(b.name)), [foods]);
  const overridden = useMemo(() => [...overrides.values()].filter((o) => o.overrideFodmap || o.favorite), [overrides]);
  const needIngredients = mine.filter((f) => f.source === 'freeText' && f.kind === 'ingredient');
  const hits = useMemo(() => (q.trim().length >= 2 ? searchFoods(q, foods, 40) : []), [q, foods]);
  const refList = useMemo(() => REFERENCE.filter((r) => r.tier === 'primary' && (!cat || r.category === cat)).sort((a, b) => a.name.localeCompare(b.name)), [cat]);

  const Row = ({ id }: { id: string }) => {
    const v = resolve(id); if (!v) return null;
    return (
      <li>
        <Link to={`/foods/${encodeURIComponent(v.id)}`} className="flex items-center justify-between gap-2 py-2">
          <span className="min-w-0 truncate text-sm">{v.favorite && '★ '}{v.name}{v.kind === 'dish' && <span className="ml-1 text-xs text-slate-400">dish</span>}</span>
          <FodmapPills profile={v.fodmap} overall={v.overall} groupUnknown={v.groupUnknown} conflictCount={v.conflictCount} />
        </Link>
      </li>
    );
  };

  return (
    <div className="space-y-3">
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search all foods" className="w-full rounded-xl border border-slate-300 px-3 py-2 text-base" />
      {q.trim().length >= 2 ? (
        <Card>{hits.length ? <ul className="divide-y divide-slate-100">{hits.map((h) => <Row key={h.id} id={h.id} />)}</ul> : <Empty>no matches</Empty>}</Card>
      ) : (
        <>
          <div className="flex gap-2">
            <Chip active={tab === 'mine'} onClick={() => setTab('mine')}>My foods ({mine.length})</Chip>
            <Chip active={tab === 'reference'} onClick={() => setTab('reference')}>Reference ({REFERENCE.length})</Chip>
          </div>
          {tab === 'mine' && (
            <>
              {needIngredients.length > 0 && (
                <Card className="border-amber-200 bg-amber-50">
                  <Label>Needs ingredients ({needIngredients.length})</Label>
                  <p className="mb-1 text-xs text-amber-800">These were typed in without a match. Add ingredients so the analysis can see what's inside.</p>
                  <ul className="divide-y divide-amber-100">{needIngredients.map((f) => <Row key={f.id} id={f.id} />)}</ul>
                </Card>
              )}
              {overridden.length > 0 && (
                <Card><Label>Overridden or favorited reference foods</Label>
                  <ul className="divide-y divide-slate-100">{overridden.map((o) => <Row key={o.id} id={refKey(o.refId!)} />)}</ul></Card>
              )}
              <Card><Label>Dishes and custom foods</Label>
                {mine.length ? <ul className="divide-y divide-slate-100">{mine.map((f) => <Row key={f.id} id={f.id} />)}</ul> : <Empty>Foods you create while logging show up here.</Empty>}
              </Card>
            </>
          )}
          {tab === 'reference' && (
            <>
              <div className="flex flex-wrap gap-1.5">{CATS.map((c) => <Chip key={c} active={cat === c} onClick={() => setCat(cat === c ? null : c)}>{c}</Chip>)}</div>
              <Card><ul className="divide-y divide-slate-100">{refList.slice(0, 200).map((r) => <Row key={r.id} id={refKey(r.id)} />)}</ul>
                {refList.length > 200 && <p className="pt-2 text-center text-xs text-slate-400">showing 200 of {refList.length}, use search or a category</p>}</Card>
            </>
          )}
        </>
      )}
    </div>
  );
}
