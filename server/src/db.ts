import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

export const TABLES = ['foods', 'entries', 'dayLogs', 'symptomEvents', 'phases'] as const;
export type Table = (typeof TABLES)[number];
export interface Row { id: string; updatedAt: number; deleted: 0 | 1; [k: string]: unknown }

const path = process.env.DB_PATH ?? './data/gutlog.db';
mkdirSync(dirname(path), { recursive: true });
export const db = new DatabaseSync(path);
db.exec(`
  PRAGMA journal_mode = WAL;
  CREATE TABLE IF NOT EXISTS rows (
    tbl TEXT NOT NULL, id TEXT NOT NULL, updatedAt INTEGER NOT NULL, deleted INTEGER NOT NULL DEFAULT 0,
    body TEXT NOT NULL, receivedAt INTEGER NOT NULL,
    PRIMARY KEY (tbl, id)
  );
  CREATE INDEX IF NOT EXISTS rows_tbl_received ON rows (tbl, receivedAt);
`);

const getStmt = db.prepare('SELECT updatedAt FROM rows WHERE tbl = ? AND id = ?');
const putStmt = db.prepare('INSERT OR REPLACE INTO rows (tbl, id, updatedAt, deleted, body, receivedAt) VALUES (?, ?, ?, ?, ?, ?)');
const sinceStmt = db.prepare('SELECT body FROM rows WHERE tbl = ? AND receivedAt > ? ORDER BY receivedAt');

/** Last-writer-wins by the client's updatedAt. Returns number of rows accepted. */
export function applyChanges(changes: Partial<Record<Table, Row[]>>, receivedAt: number): number {
  let n = 0;
  db.exec('BEGIN');
  try {
    for (const t of TABLES) {
      for (const row of changes[t] ?? []) {
        if (!row || typeof row.id !== 'string' || typeof row.updatedAt !== 'number') continue;
        const cur = getStmt.get(t, row.id) as { updatedAt: number } | undefined;
        if (cur && cur.updatedAt >= row.updatedAt) continue;
        putStmt.run(t, row.id, row.updatedAt, row.deleted ? 1 : 0, JSON.stringify(row), receivedAt);
        n++;
      }
    }
    db.exec('COMMIT');
  } catch (e) { db.exec('ROLLBACK'); throw e; }
  return n;
}

/** Rows received by the server after `since` (server clock), so a client never misses a late-arriving row. */
export function changesSince(since: number): Partial<Record<Table, Row[]>> {
  const out: Partial<Record<Table, Row[]>> = {};
  for (const t of TABLES) {
    const rows = (sinceStmt.all(t, since) as { body: string }[]).map((r) => JSON.parse(r.body) as Row);
    if (rows.length) out[t] = rows;
  }
  return out;
}

export function counts(): Record<string, number> {
  const out: Record<string, number> = {};
  for (const t of TABLES) out[t] = (db.prepare('SELECT COUNT(*) AS n FROM rows WHERE tbl = ? AND deleted = 0').get(t) as { n: number }).n;
  return out;
}
