/**
 * Local-first sync with the DigitalOcean API. Every synced table has id/updatedAt/deleted. Push rows changed since the
 * last push, pull rows changed since the last pull, last-writer-wins by updatedAt on both sides.
 */
import { useEffect } from 'react';
import { db } from '../db/schema';
import { getSetting, setSetting } from '../db/repo';
import { SYNC_TABLES, type SyncTable } from '../types';

export interface SyncStatus { at: number; ok: boolean; pushed: number; pulled: number; error?: string }
type Row = { id: string; updatedAt: number; deleted: 0 | 1 } & Record<string, unknown>;

export function normalizeApiBase(raw: string): string {
  let s = raw.trim().replace(/\/+$/, '');
  if (s && !/^https?:\/\//i.test(s)) s = `https://${s}`;
  return s;
}
export async function getSyncConfig(): Promise<{ apiBase: string; token: string } | null> {
  const apiBase = normalizeApiBase((await getSetting('apiBase')) ?? '');
  const token = ((await getSetting('token')) ?? '').trim();
  return apiBase && token ? { apiBase, token } : null;
}

let inflight: Promise<SyncStatus> | null = null;
/** Never rejects: every failure becomes a SyncStatus with an error message the UI can show. */
export function syncNow(): Promise<SyncStatus> {
  if (inflight) return inflight;
  inflight = doSync()
    .catch(async (e: unknown) => {
      const msg = e instanceof Error ? (e.name === 'TimeoutError' ? 'timed out after 20 s' : e.name === 'TypeError' ? `network or CORS error (${e.message})` : e.message) : String(e);
      const s: SyncStatus = { at: Date.now(), ok: false, pushed: 0, pulled: 0, error: msg };
      await setSetting('lastSync', JSON.stringify(s)).catch(() => {});
      return s;
    })
    .finally(() => { inflight = null; });
  return inflight;
}

async function doSync(): Promise<SyncStatus> {
  const cfg = await getSyncConfig();
  if (!cfg) return { at: Date.now(), ok: false, pushed: 0, pulled: 0, error: 'not configured' };
  const lastPush = Number((await getSetting('lastPushAt')) ?? 0);
  const lastPull = Number((await getSetting('lastPullAt')) ?? 0);
  const changes: Partial<Record<SyncTable, Row[]>> = {};
  let pushed = 0;
  for (const t of SYNC_TABLES) {
    const rows = (await db[t].where('updatedAt').above(lastPush).toArray()) as unknown as Row[];
    if (rows.length) { changes[t] = rows; pushed += rows.length; }
  }
  const startedAt = Date.now();
  const res = await fetch(`${cfg.apiBase}/sync`, {
    method: 'POST', headers: { 'content-type': 'application/json', authorization: `Bearer ${cfg.token}` },
    body: JSON.stringify({ since: lastPull, changes }),
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) {
    const detail = await res.json().then((j: { error?: string }) => j.error).catch(() => '');
    const s: SyncStatus = { at: Date.now(), ok: false, pushed: 0, pulled: 0, error: `HTTP ${res.status}${detail ? `: ${detail}` : ''}` };
    await setSetting('lastSync', JSON.stringify(s)); return s;
  }
  const body = (await res.json()) as { now: number; changes: Partial<Record<SyncTable, Row[]>> };
  let pulled = 0;
  await db.transaction('rw', [db.foods, db.entries, db.dayLogs, db.symptomEvents, db.phases], async () => {
    for (const t of SYNC_TABLES) {
      for (const row of body.changes[t] ?? []) {
        const cur = (await db[t].get(row.id)) as Row | undefined;
        if (!cur || cur.updatedAt < row.updatedAt) { await (db[t] as unknown as { put: (r: Row) => Promise<unknown> }).put(row); pulled++; }
      }
    }
  });
  await setSetting('lastPushAt', String(startedAt));
  await setSetting('lastPullAt', String(body.now));
  const s: SyncStatus = { at: Date.now(), ok: true, pushed, pulled };
  await setSetting('lastSync', JSON.stringify(s));
  return s;
}

/** Sync on load, when returning to the app, and on a debounce after local writes. */
export function useAutoSync() {
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const kick = () => { clearTimeout(timer); timer = setTimeout(() => { syncNow().catch(() => {}); }, 4000); };
    syncNow().catch(() => {});
    const onVis = () => { if (document.visibilityState === 'visible') kick(); };
    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('online', kick);
    const hooks = SYNC_TABLES.map((t) => {
      const c = () => kick(); const u = () => kick(); const d = () => kick();
      db[t].hook('creating', c); db[t].hook('updating', u); db[t].hook('deleting', d);
      return () => { db[t].hook('creating').unsubscribe(c); db[t].hook('updating').unsubscribe(u); db[t].hook('deleting').unsubscribe(d); };
    });
    return () => { document.removeEventListener('visibilitychange', onVis); window.removeEventListener('online', kick); hooks.forEach((h) => h()); clearTimeout(timer); };
  }, []);
}
