import type { Analysis } from './engine';
import type { WorkerRequest } from './worker';
import { entriesBetween, dayLogsBetween, eventsBetween } from '../../db/repo';
import type { FoodView } from '../../types';

/** Collect everything the engine needs for [from, to] and run it off the main thread. */
export async function runAnalysis(from: string, to: string, resolve: (id: string) => FoodView | null): Promise<Analysis> {
  const [entries, dayLogs, events] = await Promise.all([entriesBetween(from, to), dayLogsBetween(from, to), eventsBetween(from, to)]);
  const views: Record<string, FoodView> = {};
  const collect = (id: string, depth = 0) => {
    if (views[id] || depth > 4) return; const v = resolve(id); if (!v) return; views[id] = v;
    for (const i of v.ingredients) collect(i.foodId, depth + 1);
  };
  for (const e of entries) collect(e.foodId);
  const req: WorkerRequest = { entries, dayLogs, events, views, from, to };
  return new Promise((res, rej) => {
    const w = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });
    w.onmessage = (ev: MessageEvent<Analysis>) => { res(ev.data); w.terminate(); };
    w.onerror = (e) => { rej(e); w.terminate(); };
    w.postMessage(req);
  });
}
