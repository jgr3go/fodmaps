import { useLiveQuery } from 'dexie-react-hooks';
import { useState } from 'react';
import { Button, Card, Chip, Label } from './ui';
import { addEvent, deleteEvent, eventsForDate, getDayLog, upsertDayLog } from '../db/repo';
import { nowTime } from '../lib/dates';
import { EXERCISE, SYMPTOMS, type Exercise, type Symptom } from '../types';

export function SymptomCard({ date }: { date: string }) {
  const log = useLiveQuery(() => getDayLog(date), [date]);
  const events = useLiveQuery(() => eventsForDate(date), [date], []);
  const [showEvent, setShowEvent] = useState(false);
  const [evTime, setEvTime] = useState(nowTime());
  const [evSev, setEvSev] = useState(5);
  const [evSym, setEvSym] = useState<Symptom[]>([]);
  const distress = log?.distress ?? null;
  const symptoms = log?.symptoms ?? [];

  const toggle = (s: Symptom) => upsertDayLog(date, { symptoms: symptoms.includes(s) ? symptoms.filter((x) => x !== s) : [...symptoms, s] });

  return (
    <Card>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">How was your gut today?</h3>
        <span className={`text-2xl font-bold ${distress == null ? 'text-slate-300' : distress >= 7 ? 'text-rose-600' : distress >= 4 ? 'text-amber-600' : 'text-emerald-600'}`}>{distress ?? '–'}</span>
      </div>
      <input type="range" min={0} max={10} step={1} value={distress ?? 0} onChange={(e) => upsertDayLog(date, { distress: Number(e.target.value) })} className="mt-1 w-full" />
      <div className="flex justify-between text-[10px] text-slate-400"><span>0 fine</span><span>5 uncomfortable</span><span>10 worst</span></div>
      {distress == null && <p className="mt-1 text-xs text-slate-400">Slide to record. Recording 0 on good days matters as much as bad ones.</p>}

      <div className="mt-3"><Label>Symptoms</Label>
        <div className="flex flex-wrap gap-1.5">{SYMPTOMS.map((s) => <Chip key={s} tone="rose" active={symptoms.includes(s)} onClick={() => toggle(s)}>{s}</Chip>)}</div>
      </div>
      <div className="mt-3"><Label>Exercise</Label>
        <div className="flex flex-wrap gap-1.5">{EXERCISE.map((e: Exercise) => <Chip key={e} active={log?.exercise === e} onClick={() => upsertDayLog(date, { exercise: e })}>{e}</Chip>)}</div>
      </div>
      <div className="mt-3">
        <textarea value={log?.notes ?? ''} onChange={(e) => upsertDayLog(date, { notes: e.target.value })} placeholder="Notes (stress, travel, meds, anything unusual)" rows={1}
          className="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-sm" />
      </div>

      <div className="mt-3 border-t border-slate-100 pt-3">
        <div className="flex items-center justify-between">
          <Label>Flare-ups (timed)</Label>
          <button className="text-xs font-medium text-teal-700" onClick={() => { setEvTime(nowTime()); setShowEvent(!showEvent); }}>{showEvent ? 'cancel' : '+ log a flare-up'}</button>
        </div>
        {events && events.length > 0 && (
          <ul className="mt-1 space-y-1">
            {events.map((e) => (
              <li key={e.id} className="flex items-center justify-between rounded-lg bg-rose-50 px-3 py-1.5 text-sm">
                <span><b>{e.time}</b> · {e.severity}/10 {e.symptoms.length ? `· ${e.symptoms.join(', ')}` : ''}</span>
                <button className="text-slate-400" onClick={() => deleteEvent(e.id)}>✕</button>
              </li>
            ))}
          </ul>
        )}
        {showEvent && (
          <div className="mt-2 rounded-xl bg-slate-50 p-3">
            <div className="flex items-center gap-2">
              <input type="time" value={evTime} onChange={(e) => setEvTime(e.target.value)} className="rounded-lg border border-slate-300 px-2 py-1 text-sm" />
              <input type="range" min={0} max={10} value={evSev} onChange={(e) => setEvSev(Number(e.target.value))} className="flex-1" />
              <span className="w-6 text-right text-sm font-semibold">{evSev}</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">{SYMPTOMS.map((s) => <Chip key={s} tone="rose" active={evSym.includes(s)} onClick={() => setEvSym(evSym.includes(s) ? evSym.filter((x) => x !== s) : [...evSym, s])}>{s}</Chip>)}</div>
            <Button className="mt-2 w-full" onClick={async () => { await addEvent({ date, time: evTime, severity: evSev, symptoms: evSym, notes: '' }); setShowEvent(false); setEvSym([]); }}>Save flare-up</Button>
            <p className="mt-1 text-[11px] text-slate-500">Timed flare-ups let the analysis separate fast reactions (allergy-like, within hours) from slow ones (FODMAP-like, next day or later).</p>
          </div>
        )}
      </div>
    </Card>
  );
}
