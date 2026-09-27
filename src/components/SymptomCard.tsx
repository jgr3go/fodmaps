import { useLiveQuery } from 'dexie-react-hooks';
import { useState } from 'react';
import { Button, Card, Chip, Label } from './ui';
import { Scale } from './Scale';
import { addEvent, deleteEvent, eventsForDate, getDayLog, upsertDayLog } from '../db/repo';
import { nowTime, today } from '../lib/dates';
import { DAY_FLAGS, EXERCISE, SYMPTOMS, type DayFlag, type Exercise, type Symptom } from '../types';

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
  const flags = log?.flags ?? [];
  const toggleFlag = (f: DayFlag) => upsertDayLog(date, { flags: flags.includes(f) ? flags.filter((x) => x !== f) : [...flags, f] });

  return (
    <Card>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">How was your gut today?</h3>
        <span className={`text-2xl font-bold ${distress == null ? 'text-slate-300' : distress >= 7 ? 'text-rose-600' : distress >= 4 ? 'text-amber-600' : 'text-emerald-600'}`}>{distress ?? '–'}</span>
      </div>
      <div className="mt-2"><Scale value={distress} onChange={(v) => upsertDayLog(date, { distress: v })} /></div>
      <div className="flex justify-between text-[10px] text-slate-400"><span>0 fine</span><span>5 uncomfortable</span><span>10 worst</span></div>
      <div className="mt-2 flex items-center gap-2">
        <button onClick={() => upsertDayLog(date, { distress: 0 })} className={`rounded-full border px-3 py-1 text-xs font-medium ${distress === 0 && !log?.autoZero ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-emerald-300 bg-emerald-50 text-emerald-800'}`}>✓ Felt fine (0)</button>
        {distress == null && <span className="text-[11px] text-slate-400">{date === today() ? 'Untouched days with food logged are recorded as 0 tomorrow.' : 'Not rated. Will be recorded as 0 automatically.'}</span>}
        {log?.autoZero && <span className="text-[11px] text-slate-400">Recorded as 0 automatically. Slide or tap to change.</span>}
      </div>

      <div className="mt-3"><Label>Symptoms</Label>
        <div className="flex flex-wrap gap-1.5">{SYMPTOMS.map((s) => <Chip key={s} tone="rose" active={symptoms.includes(s)} onClick={() => toggle(s)}>{s}</Chip>)}</div>
      </div>
      <div className="mt-3"><Label>Exercise</Label>
        <div className="flex flex-wrap gap-1.5">{EXERCISE.map((e: Exercise) => <Chip key={e} active={log?.exercise === e} onClick={() => upsertDayLog(date, { exercise: e })}>{e}</Chip>)}</div>
      </div>
      <div className="mt-3"><Label>Day context</Label>
        <div className="flex flex-wrap gap-1.5">{DAY_FLAGS.map((f) => <Chip key={f.key} active={flags.includes(f.key)} onClick={() => toggleFlag(f.key)}>{f.label}</Chip>)}</div>
        <p className="mt-1 text-[10px] text-slate-400">Things that upset a gut without food. Each is ranked against foods in Insights so they don't get blamed on breakfast.</p>
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
              <span className="text-xs text-slate-500">severity</span>
            </div>
            <div className="mt-2"><Scale value={evSev} onChange={setEvSev} size="sm" /></div>
            <div className="mt-2 flex flex-wrap gap-1.5">{SYMPTOMS.map((s) => <Chip key={s} tone="rose" active={evSym.includes(s)} onClick={() => setEvSym(evSym.includes(s) ? evSym.filter((x) => x !== s) : [...evSym, s])}>{s}</Chip>)}</div>
            <Button className="mt-2 w-full" onClick={async () => { await addEvent({ date, time: evTime, severity: evSev, symptoms: evSym, notes: '' }); setShowEvent(false); setEvSym([]); }}>Save flare-up</Button>
            <p className="mt-1 text-[11px] text-slate-500">Timed flare-ups let the analysis separate fast reactions (allergy-like, within hours) from slow ones (FODMAP-like, next day or later).</p>
          </div>
        )}
      </div>
    </Card>
  );
}
