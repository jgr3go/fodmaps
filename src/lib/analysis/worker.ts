/// <reference lib="webworker" />
import { analyze, type Analysis } from './engine';
import type { DayLog, Entry, FoodView, SymptomEvent } from '../../types';

export interface WorkerRequest { entries: Entry[]; dayLogs: DayLog[]; events: SymptomEvent[]; views: Record<string, FoodView>; from: string; to: string }

self.onmessage = (ev: MessageEvent<WorkerRequest>) => {
  const { views, ...rest } = ev.data;
  const result: Analysis = analyze({ ...rest, resolve: (id) => views[id] ?? null });
  (self as unknown as Worker).postMessage(result);
};
