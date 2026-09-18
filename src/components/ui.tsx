import type { ReactNode } from 'react';

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-2xl border border-slate-200 bg-white p-3 shadow-sm ${className}`}>{children}</section>;
}
export function Button({ children, onClick, kind = 'primary', className = '', disabled, type = 'button' }: {
  children: ReactNode; onClick?: () => void; kind?: 'primary' | 'ghost' | 'danger'; className?: string; disabled?: boolean; type?: 'button' | 'submit';
}) {
  const base = 'rounded-xl px-3 py-2 text-sm font-medium active:scale-[0.98] disabled:opacity-40';
  const k = kind === 'primary' ? 'bg-teal-700 text-white' : kind === 'danger' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-slate-100 text-slate-700';
  return <button type={type} disabled={disabled} onClick={onClick} className={`${base} ${k} ${className}`}>{children}</button>;
}
export function Chip({ active, onClick, children, tone = 'teal' }: { active: boolean; onClick: () => void; children: ReactNode; tone?: 'teal' | 'rose' }) {
  const on = tone === 'teal' ? 'bg-teal-700 text-white border-teal-700' : 'bg-rose-600 text-white border-rose-600';
  return <button type="button" onClick={onClick} className={`rounded-full border px-3 py-1 text-xs font-medium ${active ? on : 'border-slate-300 bg-white text-slate-700'}`}>{children}</button>;
}
export function Sheet({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/30" onClick={onClose}>
      <div className="mx-auto max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white p-4 pb-8" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold">{title}</h2>
          <button className="text-slate-500" onClick={onClose}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}
export function Empty({ children }: { children: ReactNode }) {
  return <p className="py-6 text-center text-sm text-slate-400">{children}</p>;
}
export function Label({ children }: { children: ReactNode }) {
  return <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">{children}</div>;
}
