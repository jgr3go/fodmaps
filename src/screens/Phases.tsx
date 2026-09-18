import { useLiveQuery } from 'dexie-react-hooks';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, Chip, Empty, Label } from '../components/ui';
import { deletePhase, listPhases, savePhase, uuid } from '../db/repo';
import { today } from '../lib/dates';
import { GROUPS, GROUP_LABEL, type Group, type Phase } from '../types';

export default function Phases() {
  const phases = useLiveQuery(() => listPhases(), [], [] as Phase[]);
  const [draft, setDraft] = useState<Phase | null>(null);
  const start = (kind: Phase['kind']) => setDraft({ id: uuid(), name: kind === 'elimination' ? 'Low-FODMAP elimination' : kind === 'challenge' ? 'Challenge' : 'Free eating', kind, group: null, startDate: today(), endDate: null, notes: '', updatedAt: 0, deleted: 0 });
  const active = phases.find((p) => !p.endDate || p.endDate >= today());

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2"><Link to="/insights" className="text-slate-500">‹ insights</Link><h1 className="text-lg font-semibold">Phases</h1></div>
      <p className="text-xs text-slate-500">Mark date ranges for an elimination diet or a single-group re-challenge. Days inside a phase are labeled on the timeline so you can compare.</p>
      {active && <Card className="border-teal-200 bg-teal-50 text-sm"><b>Active:</b> {active.name}{active.group ? ` (${GROUP_LABEL[active.group]})` : ''} since {active.startDate}
        <div className="mt-2"><Button kind="ghost" onClick={() => savePhase({ ...active, endDate: today() })}>End today</Button></div></Card>}
      <div className="flex gap-2"><Button kind="ghost" onClick={() => start('elimination')}>+ elimination</Button><Button kind="ghost" onClick={() => start('challenge')}>+ challenge</Button><Button kind="ghost" onClick={() => start('free')}>+ free</Button></div>
      {draft && (
        <Card>
          <Label>Name</Label><input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" />
          {draft.kind === 'challenge' && <div className="mt-2"><Label>Group being tested</Label><div className="flex flex-wrap gap-1.5">{GROUPS.map((g: Group) => <Chip key={g} active={draft.group === g} onClick={() => setDraft({ ...draft, group: g })}>{GROUP_LABEL[g]}</Chip>)}</div></div>}
          <div className="mt-2 flex gap-2"><div className="flex-1"><Label>Start</Label><input type="date" value={draft.startDate} onChange={(e) => setDraft({ ...draft, startDate: e.target.value })} className="w-full rounded-xl border border-slate-300 px-3 py-1.5 text-sm" /></div>
            <div className="flex-1"><Label>End (optional)</Label><input type="date" value={draft.endDate ?? ''} onChange={(e) => setDraft({ ...draft, endDate: e.target.value || null })} className="w-full rounded-xl border border-slate-300 px-3 py-1.5 text-sm" /></div></div>
          <div className="mt-3 flex gap-2"><Button kind="ghost" onClick={() => setDraft(null)}>Cancel</Button><Button className="flex-1" onClick={async () => { await savePhase(draft); setDraft(null); }}>Save phase</Button></div>
        </Card>
      )}
      <Card>{phases.length === 0 ? <Empty>No phases yet.</Empty> : (
        <ul className="divide-y divide-slate-100 text-sm">{phases.map((p) => (
          <li key={p.id} className="flex items-center justify-between py-2"><span>{p.name}{p.group ? ` · ${GROUP_LABEL[p.group]}` : ''}<span className="ml-2 text-xs text-slate-400">{p.startDate} → {p.endDate ?? 'ongoing'}</span></span><button className="text-xs text-rose-600" onClick={() => deletePhase(p.id)}>delete</button></li>
        ))}</ul>)}</Card>
    </div>
  );
}
