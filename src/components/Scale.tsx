/** 0-10 rating as tappable segments. Unlike a range input, a scroll that starts on a segment never changes the value. */
export function Scale({ value, onChange, size = 'md' }: { value: number | null; onChange: (v: number) => void; size?: 'md' | 'sm' }) {
  const tone = (v: number) => (v === 0 ? 'bg-emerald-600' : v <= 3 ? 'bg-emerald-500' : v <= 6 ? 'bg-amber-500' : 'bg-rose-600');
  return (
    <div className={`grid grid-cols-11 gap-1 ${size === 'sm' ? 'text-[11px]' : 'text-xs'}`} role="radiogroup" aria-label="distress 0 to 10">
      {Array.from({ length: 11 }, (_, v) => (
        <button key={v} type="button" role="radio" aria-checked={value === v} onClick={() => onChange(v)}
          className={`${size === 'sm' ? 'h-7' : 'h-9'} rounded-md font-semibold transition-colors ${value === v ? `${tone(v)} text-white` : 'bg-slate-100 text-slate-600 active:bg-slate-200'}`}>
          {v}
        </button>
      ))}
    </div>
  );
}
