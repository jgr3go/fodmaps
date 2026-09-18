import Dexie, { type Table } from 'dexie';
import type { DayLog, Entry, Food, Phase, Setting, SymptomEvent } from '../types';

export class GutDb extends Dexie {
  foods!: Table<Food, string>;
  entries!: Table<Entry, string>;
  dayLogs!: Table<DayLog, string>;
  symptomEvents!: Table<SymptomEvent, string>;
  phases!: Table<Phase, string>;
  settings!: Table<Setting, string>;

  constructor() {
    super('gutlog');
    this.version(1).stores({
      foods: 'id, name, refId, updatedAt, deleted',
      entries: 'id, date, foodId, updatedAt, deleted, [date+slot]',
      dayLogs: 'id, updatedAt, deleted',
      symptomEvents: 'id, date, updatedAt, deleted',
      phases: 'id, startDate, updatedAt, deleted',
      settings: 'key',
    });
  }
}

export const db = new GutDb();
