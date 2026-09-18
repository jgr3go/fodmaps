import { db } from '../db/schema';

export async function exportJson(): Promise<Blob> {
  const dump = {
    app: 'gutlog', version: 1, exportedAt: new Date().toISOString(),
    foods: await db.foods.toArray(), entries: await db.entries.toArray(), dayLogs: await db.dayLogs.toArray(),
    symptomEvents: await db.symptomEvents.toArray(), phases: await db.phases.toArray(),
  };
  return new Blob([JSON.stringify(dump, null, 2)], { type: 'application/json' });
}

export async function downloadExport(): Promise<void> {
  const blob = await exportJson();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = `gutlog-${new Date().toISOString().slice(0, 10)}.json`; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

/** Import merges by last-writer-wins on updatedAt, so it is safe to run against a populated database. */
export async function importJson(file: File): Promise<{ imported: number }> {
  const dump = JSON.parse(await file.text()) as Record<string, { id: string; updatedAt: number }[]>;
  let imported = 0;
  await db.transaction('rw', [db.foods, db.entries, db.dayLogs, db.symptomEvents, db.phases], async () => {
    for (const t of ['foods', 'entries', 'dayLogs', 'symptomEvents', 'phases'] as const) {
      for (const row of dump[t] ?? []) {
        const cur = await db[t].get(row.id);
        if (!cur || cur.updatedAt < row.updatedAt) { await (db[t] as unknown as { put: (r: unknown) => Promise<unknown> }).put(row); imported++; }
      }
    }
  });
  return { imported };
}
