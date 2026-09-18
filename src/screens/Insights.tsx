import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Button, Card, Chip, Empty, Label } from '../components/ui';
import { Calendar } from '../components/Calendar';
import { useFoodResolver } from '../db/hooks';
import { getSetting, setSetting } from '../db/repo';
import { avoidCandidates, daysUntilUseful, isFastReactor, type Analysis, type FeatureResult } from '../lib/analysis/engine';
import { runAnalysis } from '../lib/analysis/run';
import { addDays, today } from '../lib/dates';
import { buildDigest } from '../lib/digest';
import { getSyncConfig } from '../lib/sync';
import { GROUPS, GROUP_LABEL, type Group } from '../types';
import tagsJson from '../../data/tags.json';

const TAG_LABEL = (tagsJson as { tags: Record<string, string> }).tags;
// Validated categorical palette (dataviz reference, slots 1-5, light surface). Order is the CVD-safety mechanism.
const GROUP_COLOR: Record<Group, string> = { fructans: '#2a78d6', gos: '#eb6834', lactose: '#1baf7a', fructose: '#eda100', polyols: '#e87ba4' };
const ACCENT = '#0f766e', MUTED = '#cbd5e1';

export default function Insights() {
  const { resolve, ready } = useFoodResolver();
  const [range, setRange] = useState<30 | 60 | 90 | 180>(60);
  const [a, setA] = useState<Analysis | null>(null);
  const [busy, setBusy] = useState(false);
  const [kind, setKind] = useState<'food' | 'group' | 'tag'>('food');
  const [showTable, setShowTable] = useState(false);
  const [summary, setSummary] = useState<{ at: number; text: string } | null>(null);
  const [summarizing, setSummarizing] = useState<string | null>(null);

  useEffect(() => { getSetting('llmSummary').then((s) => s && setSummary(JSON.parse(s))); }, []);
  useEffect(() => {
    if (!ready) return; let alive = true; setBusy(true);
    runAnalysis(addDays(today(), -(Math.max(range, 92) - 1)), today(), resolve).then((r) => { if (alive) { setA(r); setBusy(false); } }).catch(() => setBusy(false));
    return () => { alive = false; };
  }, [ready, range, resolve]);

  const shown = useMemo(() => (a ? a.features.filter((f) => (kind === 'food' ? f.kind === 'food' || f.kind === 'ingredient' : f.kind === kind) && f.confidence !== 'hidden').slice(0, 15) : []), [a, kind]);
  const fast = useMemo(() => (a ? a.features.filter(isFastReactor).slice(0, 5) : []), [a]);
  const chartDays = useMemo(() => (a ? a.days.slice(-Math.min(range, 90)).map((d) => ({ ...d, label: d.date.slice(5) })) : []), [a, range]);

  async function summarize() {
    if (!a) return;
    const cfg = await getSyncConfig();
    if (!cfg) { setSummarizing('Set the API address and token in Settings first.'); return; }
    setSummarizing('Asking for a readout…');
    try {
      const res = await fetch(`${cfg.apiBase}/analyze`, { method: 'POST', headers: { 'content-type': 'application/json', authorization: `Bearer ${cfg.token}` }, body: JSON.stringify(buildDigest(a)) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const { text } = (await res.json()) as { text: string };
      const s = { at: Date.now(), text }; setSummary(s); await setSetting('llmSummary', JSON.stringify(s)); setSummarizing(null);
    } catch (e) { setSummarizing(`Failed: ${(e as Error).message}`); }
  }

  if (!ready || (!a && busy)) return <Empty>Crunching…</Empty>;
  if (!a) return <Empty>No data yet.</Empty>;
  const need = daysUntilUseful(a);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <h1 className="flex-1 text-lg font-semibold">Insights</h1>
        {([30, 60, 90, 180] as const).map((r) => <Chip key={r} active={range === r} onClick={() => setRange(r)}>{r}d</Chip>)}
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Stat label="days logged" value={a.loggedDays} />
        <Stat label="avg distress" value={Number.isFinite(a.meanDistress) ? a.meanDistress.toFixed(1) : '–'} />
        <Stat label="bad days (6+)" value={a.badDays} />
      </div>
      <Calendar days={a.days} months={range >= 90 ? 3 : 2} />
      {need > 0 && <Card className="border-amber-200 bg-amber-50 text-xs text-amber-900">About {need} more logged days before per-food results mean much. Log 0 on good days too. FODMAP flags and the load chart work now.</Card>}

      <Card>
        <Label>Daily distress</Label>
        <div className="h-40">
          <ResponsiveContainer>
            <LineChart data={chartDays} margin={{ top: 8, right: 8, bottom: 0, left: -24 }}>
              <CartesianGrid vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="label" tick={{ fontSize: 10 }} interval="preserveStartEnd" tickLine={false} axisLine={false} />
              <YAxis domain={[0, 10]} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ fontSize: 12 }} formatter={(v) => [v as number, 'distress']} />
              <Line type="monotone" dataKey="distress" stroke={ACCENT} strokeWidth={2} dot={{ r: 2 }} connectNulls={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <Label>Daily FODMAP load by group</Label>
        <div className="h-40">
          <ResponsiveContainer>
            <BarChart data={chartDays} margin={{ top: 8, right: 8, bottom: 0, left: -24 }} barCategoryGap={1}>
              <CartesianGrid vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="label" tick={{ fontSize: 10 }} interval="preserveStartEnd" tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ fontSize: 12 }} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              {GROUPS.map((g) => <Bar key={g} dataKey={`load.${g}`} name={GROUP_LABEL[g]} stackId="l" fill={GROUP_COLOR[g]} stroke="#fff" strokeWidth={1} isAnimationActive={false} />)}
            </BarChart>
          </ResponsiveContainer>
        </div>
        <button className="mt-1 text-xs text-teal-700 underline" onClick={() => setShowTable(!showTable)}>{showTable ? 'hide' : 'show'} as table</button>
        {showTable && (
          <div className="mt-2 max-h-56 overflow-auto"><table className="w-full text-[11px]"><thead><tr className="text-left text-slate-500"><th>date</th><th>distress</th>{GROUPS.map((g) => <th key={g}>{GROUP_LABEL[g]}</th>)}</tr></thead>
            <tbody>{[...chartDays].reverse().map((d) => <tr key={d.date} className="border-t border-slate-100"><td>{d.date}</td><td>{d.distress ?? '–'}</td>{GROUPS.map((g) => <td key={g}>{d.load[g].toFixed(1)}</td>)}</tr>)}</tbody></table></div>
        )}
      </Card>

      <Card>
        <Label>Cumulative load vs distress (trailing 72 h, Spearman)</Label>
        <table className="w-full text-xs"><thead><tr className="text-left text-slate-500"><th>group</th><th>same day</th><th>next day</th></tr></thead>
          <tbody>{a.loadCorrelation.map((c) => (
            <tr key={c.group} className="border-t border-slate-100"><td className="py-1 capitalize">{c.group}</td><td><Rho v={c.rhoSameDay} /></td><td><Rho v={c.rhoNextDay} /></td></tr>
          ))}</tbody></table>
        <p className="mt-1 text-[11px] text-slate-500">Positive values mean higher load goes with worse days. Above 0.3 with 30+ days is worth attention. n={a.loadCorrelation[0]?.n ?? 0}</p>
      </Card>

      {fast.length > 0 && (
        <Card className="border-rose-200">
          <Label>Fast reactions (flare-up within 4 h)</Label>
          <ul className="space-y-1 text-sm">{fast.map((f) => (
            <li key={f.key} className="flex justify-between"><span>{labelOf(f)}</span><span className="text-xs text-slate-500">{f.fast!.eventsWithin4h}/{f.fast!.exposuresTimed} · {f.fast!.ratio.toFixed(1)}x · ~{f.fast!.medianDelayH?.toFixed(1)} h</span></li>
          ))}</ul>
          <p className="mt-1 text-[11px] text-slate-500">Reactions this quick are more allergy- or intolerance-like than FODMAP-like. Worth raising with a clinician.</p>
        </Card>
      )}

      <Card>
        <div className="flex items-center gap-2"><Label>Suspects</Label><span className="flex-1" />
          <Chip active={kind === 'food'} onClick={() => setKind('food')}>foods</Chip><Chip active={kind === 'group'} onClick={() => setKind('group')}>FODMAP groups</Chip><Chip active={kind === 'tag'} onClick={() => setKind('tag')}>other</Chip></div>
        {shown.length === 0 ? <Empty>Nothing with enough exposures yet.</Empty> : (
          <>
            <div style={{ height: 24 * shown.length + 24 }}>
              <ResponsiveContainer>
                <BarChart data={shown.map((f) => ({ name: labelOf(f), lift: Math.max(0, f.bestLift), strong: f.confidence === 'strong' }))} layout="vertical" margin={{ top: 0, right: 30, bottom: 0, left: 0 }}>
                  <XAxis type="number" hide domain={[0, 'dataMax']} />
                  <YAxis type="category" dataKey="name" width={130} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ fontSize: 12 }} formatter={(v) => [(v as number).toFixed(2), 'lift']} />
                  <Bar dataKey="lift" isAnimationActive={false} radius={[0, 4, 4, 0]} barSize={12} label={{ position: 'right', fontSize: 10, formatter: (v: unknown) => `+${(v as number).toFixed(1)}` }}
                    shape={(p: unknown) => { const q = p as { x: number; y: number; width: number; height: number; payload: { strong: boolean } }; return <rect x={q.x} y={q.y} width={Math.max(0, q.width)} height={q.height} rx={4} fill={q.payload.strong ? ACCENT : MUTED} />; }} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <ul className="mt-2 divide-y divide-slate-100 text-xs">{shown.map((f) => (
              <li key={f.key} className="flex items-center justify-between py-1.5">
                <span className="min-w-0">{f.foodId ? <Link to={`/foods/${encodeURIComponent(f.foodId)}`} className="underline">{labelOf(f)}</Link> : labelOf(f)}
                  <span className="ml-1 text-slate-400">{f.kind === 'ingredient' ? 'ingredient · ' : ''}{f.exposureDays}d · lag {f.bestLag}{Number.isFinite(f.bestP) ? ` · p ${f.bestP.toFixed(2)}` : ''}</span></span>
                <Conf c={f.confidence} />
              </li>
            ))}</ul>
            <p className="mt-2 text-[11px] text-slate-500">Lift = how much worse (0-10) days after eating it were than days without it. Lag is the delay in days with the strongest signal. Green = 8+ exposures and unlikely to be chance.</p>
          </>
        )}
      </Card>

      {avoidCandidates(a).length > 0 && (
        <Card className="border-teal-200 bg-teal-50">
          <Label>Consider avoiding, then re-testing</Label>
          <p className="text-sm">{avoidCandidates(a).map((f) => f.label).join(', ')}</p>
          <p className="mt-1 text-[11px] text-teal-800">Strong signal and at least +1 on the distress scale. Drop one at a time for two weeks, then track a re-challenge in <Link to="/phases" className="underline">Phases</Link>.</p>
        </Card>
      )}

      <Card>
        <div className="flex items-center justify-between"><Label>Plain-English readout</Label><Button kind="ghost" onClick={summarize} disabled={a.loggedDays < 7}>Analyze</Button></div>
        {summarizing && <p className="text-xs text-slate-500">{summarizing}</p>}
        {summary ? (<><p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed">{summary.text}</p><p className="mt-2 text-[11px] text-slate-400">Generated {new Date(summary.at).toLocaleString()} · this is pattern-finding, not medical advice.</p></>)
          : <p className="text-xs text-slate-500">Sends the anonymized statistics above (no notes) to your server, which asks Claude for a readout.</p>}
      </Card>
    </div>
  );
}

function labelOf(f: FeatureResult): string { return f.kind === 'tag' ? TAG_LABEL[f.label] ?? f.label : f.kind === 'group' ? GROUP_LABEL[f.label as Group] ?? f.label : f.label; }
function Stat({ label, value }: { label: string; value: string | number }) {
  return <Card className="p-2 text-center"><div className="text-xl font-bold">{value}</div><div className="text-[10px] uppercase tracking-wide text-slate-500">{label}</div></Card>;
}
function Rho({ v }: { v: number }) {
  if (!Number.isFinite(v)) return <span className="text-slate-300">–</span>;
  const cls = v >= 0.3 ? 'text-rose-700 font-semibold' : v >= 0.15 ? 'text-amber-700' : 'text-slate-600';
  return <span className={cls}>{v >= 0 ? '+' : ''}{v.toFixed(2)}</span>;
}
function Conf({ c }: { c: FeatureResult['confidence'] }) {
  const m = { strong: 'bg-emerald-100 text-emerald-800', emerging: 'bg-amber-100 text-amber-800', weak: 'bg-slate-100 text-slate-500', hidden: '' }[c];
  return <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${m}`}>{c}</span>;
}
