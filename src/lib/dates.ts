export const pad = (n: number) => String(n).padStart(2, '0');
export function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
export function today(): string { return toDateStr(new Date()); }
export function nowTime(): string { const d = new Date(); return `${pad(d.getHours())}:${pad(d.getMinutes())}`; }
export function parseDate(s: string): Date { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); }
export function addDays(s: string, n: number): string { const d = parseDate(s); d.setDate(d.getDate() + n); return toDateStr(d); }
export function diffDays(a: string, b: string): number { return Math.round((parseDate(b).getTime() - parseDate(a).getTime()) / 86400000); }
export function dateRange(from: string, to: string): string[] {
  const out: string[] = []; for (let d = from; d <= to; d = addDays(d, 1)) out.push(d); return out;
}
export function formatDate(s: string): string {
  const d = parseDate(s); const t = today();
  if (s === t) return 'Today';
  if (s === addDays(t, -1)) return 'Yesterday';
  return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}
/** Minutes since midnight for HH:mm, or null. */
export function toMinutes(t: string | null): number | null {
  if (!t) return null; const [h, m] = t.split(':').map(Number); return h * 60 + m;
}
/** Absolute minutes for date+time, for hours-scale lag math. */
export function absMinutes(date: string, time: string | null, fallbackMin = 12 * 60): number {
  return diffDays('2000-01-01', date) * 1440 + (toMinutes(time) ?? fallbackMin);
}
export function defaultSlotTime(slot: string): string {
  return { breakfast: '08:00', lunch: '12:30', dinner: '19:00', snack: '15:30', alcohol: '20:30' }[slot] ?? '12:00';
}
