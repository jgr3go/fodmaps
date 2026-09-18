import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Label } from './ui';
import { parseDate, toDateStr, today } from '../lib/dates';
import type { DaySeries } from '../lib/analysis/engine';

/**
 * Month-grid heatmap of daily distress. Sequential single-hue ramp (rose), light = mild, dark = severe;
 * unlogged days are hollow. Tap a day to open it on the Today screen.
 */
const STEPS = ['#fff1f2', '#fecdd3', '#fda4af', '#fb7185', '#e11d48', '#9f1239'];
export function distressColor(d: number | null): string | null {
  if (d == null) return null;
  if (d === 0) return '#f1f5f9';
  return STEPS[Math.min(STEPS.length - 1, Math.ceil(d / 2))]; // 1-2, 3-4, 5-6, 7-8, 9-10
}

export function Calendar({ days, months = 3 }: { days: DaySeries[]; months?: number }) {
  const nav = useNavigate();
  const byDate = useMemo(() => new Map(days.map((d) => [d.date, d])), [days]);
  const grids = useMemo(() => {
    const out: { label: string; cells: (string | null)[] }[] = [];
    const t = parseDate(today());
    for (let m = months - 1; m >= 0; m--) {
      const first = new Date(t.getFullYear(), t.getMonth() - m, 1);
      const label = first.toLocaleDateString(undefined, { month: 'long', year: m === 0 && t.getMonth() === first.getMonth() ? undefined : 'numeric' });
      const cells: (string | null)[] = Array(first.getDay()).fill(null);
      const last = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
      for (let d = 1; d <= last; d++) cells.push(toDateStr(new Date(first.getFullYear(), first.getMonth(), d)));
      out.push({ label, cells });
    }
    return out;
  }, [months]);
  const logged = days.filter((d) => d.distress != null);
  const bad = logged.filter((d) => d.distress! >= 6).length;
  const mild = logged.filter((d) => d.distress! >= 3 && d.distress! < 6).length;

  return (
    <Card>
      <div className="flex items-baseline justify-between"><Label>Calendar</Label>
        <span className="text-[11px] text-slate-500">{logged.length} logged · <span className="text-rose-700">{bad} bad</span> · <span className="text-rose-500">{mild} meh</span> · {logged.length - bad - mild} fine</span></div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {grids.map((g) => (
          <div key={g.label}>
            <div className="mb-1 text-xs font-medium text-slate-600">{g.label}</div>
            <div className="grid grid-cols-7 gap-1 text-[9px] text-slate-400">{['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <div key={i} className="text-center">{d}</div>)}</div>
            <div className="grid grid-cols-7 gap-1">
              {g.cells.map((date, i) => {
                if (!date) return <div key={i} />;
                const day = byDate.get(date); const future = date > today();
                const color = distressColor(day?.distress ?? null);
                return (
                  <button key={date} disabled={future} onClick={() => nav(`/?d=${date}`)} title={`${date}${day?.distress != null ? ` · ${day.distress}/10` : ''}${day?.symptoms.length ? ` · ${day.symptoms.join(', ')}` : ''}`}
                    className={`aspect-square rounded-md text-[10px] ${future ? 'opacity-0' : color ? 'text-slate-700' : 'border border-dashed border-slate-200 text-slate-300'} ${day?.distress != null && day.distress >= 7 ? 'text-white' : ''}`}
                    style={color ? { background: color } : undefined}>
                    {date === today() ? <span className="font-bold">{Number(date.slice(8))}</span> : Number(date.slice(8))}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-2 flex items-center gap-1 text-[10px] text-slate-500">
        <span>0</span>{['#f1f5f9', ...STEPS.slice(1)].map((c) => <span key={c} className="inline-block h-3 w-4 rounded-sm" style={{ background: c }} />)}<span>10</span>
        <span className="ml-2 inline-block h-3 w-4 rounded-sm border border-dashed border-slate-300" /><span>not logged</span>
      </div>
    </Card>
  );
}

