import { Suspense, lazy } from 'react';
import { HashRouter, NavLink, Route, Routes } from 'react-router-dom';
import Today from './screens/Today';
import Foods from './screens/Foods';
import FoodDetail from './screens/FoodDetail';
const Insights = lazy(() => import('./screens/Insights'));
import Settings from './screens/Settings';
import Phases from './screens/Phases';
import { useAutoSync } from './lib/sync';

const tabs = [
  { to: '/', label: 'Today', icon: '◔' },
  { to: '/foods', label: 'Foods', icon: '≡' },
  { to: '/insights', label: 'Insights', icon: '∿' },
  { to: '/settings', label: 'Settings', icon: '⚙' },
];

export default function App() {
  useAutoSync();
  return (
    <HashRouter>
      <div className="mx-auto min-h-full max-w-lg">
        <main className="safe-bottom px-4 pt-3">
          <Routes>
            <Route path="/" element={<Today />} />
            <Route path="/foods" element={<Foods />} />
            <Route path="/foods/:id" element={<FoodDetail />} />
            <Route path="/insights" element={<Suspense fallback={<p className="py-6 text-center text-sm text-slate-400">Loading…</p>}><Insights /></Suspense>} />
            <Route path="/phases" element={<Phases />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
        <nav className="fixed inset-x-0 bottom-0 border-t border-slate-200 bg-white/95 backdrop-blur" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
          <div className="mx-auto flex max-w-lg justify-around">
            {tabs.map((t) => (
              <NavLink key={t.to} to={t.to} end={t.to === '/'} className={({ isActive }) => `flex flex-1 flex-col items-center py-2 text-xs ${isActive ? 'text-teal-700 font-semibold' : 'text-slate-500'}`}>
                <span className="text-lg leading-none">{t.icon}</span>
                <span className="mt-0.5">{t.label}</span>
              </NavLink>
            ))}
          </div>
        </nav>
      </div>
    </HashRouter>
  );
}
