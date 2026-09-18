import { useLiveQuery } from 'dexie-react-hooks';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AddFoodSheet } from '../components/AddFoodSheet';
import { FodmapPills } from '../components/FodmapPills';
import { SymptomCard } from '../components/SymptomCard';
import { Card, Empty } from '../components/ui';
import { useFoodResolver } from '../db/hooks';
import { deleteEntry, entriesForDate, updateEntry } from '../db/repo';
import { addDays, formatDate, today } from '../lib/dates';
import { adjustProfile, worst } from '../lib/fodmap';
import { SLOTS, SLOT_LABEL, type Entry, type Portion, type Slot } from '../types';

export default function Today() {
  const [date, setDate] = useState(today());
  const [adding, setAdding] = useState<Slot | null>(null);
  const entries = useLiveQuery(() => entriesForDate(date), [date], [] as Entry[]);
  const { resolve } = useFoodResolver();
  const isToday = date === today();

  return (
    <div className="space-y-3">
      <header className="flex items-center justify-between">
        <button className="rounded-lg px-2 py-1 text-slate-500" onClick={() => setDate(addDays(date, -1))}>‹</button>
        <button className="text-base font-semibold" onClick={() => setDate(today())}>{formatDate(date)}</button>
        <button className="rounded-lg px-2 py-1 text-slate-500 disabled:opacity-20" disabled={isToday} onClick={() => setDate(addDays(date, 1))}>›</button>
      </header>

      {SLOTS.map((slot) => {
        const rows = entries.filter((e) => e.slot === slot);
        return (
          <Card key={slot}>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">{SLOT_LABEL[slot]}</h3>
              <button onClick={() => setAdding(slot)} className="rounded-full bg-teal-700 px-3 py-0.5 text-sm font-semibold text-white">+ add</button>
            </div>
            {rows.length === 0 ? <Empty>nothing logged</Empty> : (
              <ul className="mt-2 divide-y divide-slate-100">
                {rows.map((e) => <EntryRow key={e.id} entry={e} view={resolve(e.foodId)} />)}
              </ul>
            )}
          </Card>
        );
      })}

      <SymptomCard date={date} />
      <p className="px-1 text-center text-xs text-slate-400">Flags are per typical serving from public FODMAP data. Tap a food in <Link to="/foods" className="underline">Foods</Link> to see sources or override.</p>
      {adding && <AddFoodSheet open={!!adding} onClose={() => setAdding(null)} date={date} slot={adding} />}
    </div>
  );
}

function EntryRow({ entry, view }: { entry: Entry; view: ReturnType<ReturnType<typeof useFoodResolver>['resolve']> }) {
  const [open, setOpen] = useState(false);
  if (!view) return <li className="py-2 text-sm text-slate-400">unknown food <button className="ml-2 text-xs underline" onClick={() => deleteEntry(entry.id)}>remove</button></li>;
  const profile = adjustProfile(view.fodmap, entry.portion);
  const overall = view.overall === null ? null : worst(profile) ?? view.overall;
  const needsIngredients = view.user?.source === 'freeText' && view.kind !== 'dish';
  return (
    <li className="py-2">
      <button className="flex w-full items-start justify-between gap-2 text-left" onClick={() => setOpen(!open)}>
        <span className="min-w-0">
          <span className="text-sm">{view.name}</span>
          <span className="ml-1.5 text-[11px] text-slate-400">{entry.portion}{entry.time ? ` · ${entry.time}` : ''}</span>
          {needsIngredients && <span className="ml-1.5 text-[11px] text-amber-600">add ingredients →</span>}
        </span>
        <FodmapPills profile={profile} overall={overall} groupUnknown={view.groupUnknown} conflictCount={view.conflictCount} />
      </button>
      {open && (
        <div className="mt-2 flex items-center gap-2 text-xs">
          {(['S', 'M', 'L'] as Portion[]).map((p) => (
            <button key={p} onClick={() => updateEntry({ ...entry, portion: p })} className={`rounded-full border px-2.5 py-0.5 ${entry.portion === p ? 'border-teal-700 bg-teal-700 text-white' : 'border-slate-300'}`}>{p}</button>
          ))}
          <input type="time" value={entry.time ?? ''} onChange={(e) => updateEntry({ ...entry, time: e.target.value || null })} className="rounded-lg border border-slate-300 px-1.5 py-0.5" />
          <span className="flex-1" />
          <Link to={`/foods/${encodeURIComponent(view.id)}`} className="text-teal-700 underline">{needsIngredients ? 'ingredients' : 'details'}</Link>
          <button onClick={() => deleteEntry(entry.id)} className="text-rose-600">remove</button>
        </div>
      )}
    </li>
  );
}
