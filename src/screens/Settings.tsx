import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, Label } from '../components/ui';
import { getSetting, setSetting } from '../db/repo';
import { downloadExport, importJson } from '../lib/export';
import { requestPermission } from '../lib/notifications';
import { syncNow, type SyncStatus } from '../lib/sync';
import { REFERENCE } from '../lib/fodmap';

export default function Settings() {
  const [apiBase, setApiBase] = useState(''); const [token, setToken] = useState('');
  const [status, setStatus] = useState<SyncStatus | null>(null); const [busy, setBusy] = useState(false);
  const [reminder, setReminder] = useState(true); const [msg, setMsg] = useState('');
  useEffect(() => { (async () => {
    setApiBase((await getSetting('apiBase')) ?? ''); setToken((await getSetting('token')) ?? '');
    const s = await getSetting('lastSync'); if (s) setStatus(JSON.parse(s)); setReminder((await getSetting('reminder')) !== 'off');
  })(); }, []);
  async function save() { await setSetting('apiBase', apiBase.trim()); await setSetting('token', token.trim()); setBusy(true); setStatus(await syncNow()); setBusy(false); }
  return (
    <div className="space-y-3">
      <h1 className="text-lg font-semibold">Settings</h1>
      <Card>
        <Label>Sync server</Label>
        <input value={apiBase} onChange={(e) => setApiBase(e.target.value)} placeholder="https://gutlog-api.example.com" className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" autoCapitalize="off" />
        <input value={token} onChange={(e) => setToken(e.target.value)} placeholder="access token" type="password" className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" />
        <div className="mt-2 flex items-center gap-2"><Button onClick={save} disabled={busy}>Save and sync</Button><Button kind="ghost" onClick={async () => { setBusy(true); setStatus(await syncNow()); setBusy(false); }} disabled={busy}>Sync now</Button></div>
        {status && <p className={`mt-2 text-xs ${status.ok ? 'text-emerald-700' : 'text-rose-700'}`}>{status.ok ? `Synced ${new Date(status.at).toLocaleString()} · pushed ${status.pushed}, pulled ${status.pulled}` : `Sync failed: ${status.error}`}</p>}
        <p className="mt-1 text-[11px] text-slate-500">Data lives on this phone first and syncs to your server when configured. Syncing also enables the plain-English readout.</p>
      </Card>
      <Card>
        <Label>Reminder</Label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={reminder} onChange={async (e) => { setReminder(e.target.checked); await setSetting('reminder', e.target.checked ? 'on' : 'off'); if (e.target.checked) setMsg(`notifications: ${await requestPermission()}`); }} />Evening nudge to log symptoms if nothing logged after 6 pm</label>
        {msg && <p className="mt-1 text-xs text-slate-500">{msg}</p>}
      </Card>
      <Card>
        <Label>Backup</Label>
        <div className="flex gap-2"><Button kind="ghost" onClick={downloadExport}>Export JSON</Button>
          <label className="rounded-xl bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700">Import JSON<input type="file" accept="application/json" className="hidden" onChange={async (e) => { const f = e.target.files?.[0]; if (f) { const r = await importJson(f); setMsg(`imported ${r.imported} records`); } }} /></label></div>
      </Card>
      <Card>
        <Label>About the data</Label>
        <p className="text-xs text-slate-600">{REFERENCE.length} reference foods compiled from public sources (Monash public pages, clinical handouts, peer-reviewed composition papers, open datasets). Not Monash app data. Ratings are per typical serving; sources disagree on some foods and that is shown on each food. <Link to="/phases" className="underline">Phases</Link> lets you mark elimination and challenge periods.</p>
        <p className="mt-2 text-xs text-slate-500">This app finds patterns in what you log. It is not a diagnosis. Take the findings to a dietitian or GI doctor.</p>
      </Card>
    </div>
  );
}
