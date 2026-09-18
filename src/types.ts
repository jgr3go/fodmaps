export type Rating = 'high' | 'moderate' | 'low' | null;
export type Group = 'fructans' | 'gos' | 'lactose' | 'fructose' | 'polyols';
export const GROUPS: Group[] = ['fructans', 'gos', 'lactose', 'fructose', 'polyols'];
export const GROUP_LABEL: Record<Group, string> = {
  fructans: 'Fructans', gos: 'GOS', lactose: 'Lactose', fructose: 'Fructose', polyols: 'Polyols',
};
export type FodmapProfile = Record<Group, Rating>;

export type Slot = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'alcohol';
export const SLOTS: Slot[] = ['breakfast', 'lunch', 'dinner', 'snack', 'alcohol'];
export const SLOT_LABEL: Record<Slot, string> = {
  breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner', snack: 'Snacks', alcohol: 'Alcohol',
};

export type Portion = 'S' | 'M' | 'L';
export const PORTION_WEIGHT: Record<Portion, number> = { S: 0.5, M: 1, L: 1.75 };

export type Category =
  | 'vegetable' | 'fruit' | 'grain' | 'legume' | 'nut-seed' | 'dairy' | 'protein' | 'sweetener'
  | 'beverage' | 'alcohol' | 'condiment' | 'processed' | 'herb-spice' | 'additive' | 'other';

/** Static reference entry bundled from data/fodmap.json. */
export interface RefFood {
  id: string;
  name: string;
  aliases: string[];
  category: Category;
  fodmap: FodmapProfile;
  overall: Rating;
  groupUnknown: boolean;
  tier: 'primary' | 'variant';
  polyolType: string | null;
  lowServing: string | null;
  moderateServing: string | null;
  highServing: string | null;
  confidence: 'high' | 'medium' | 'low';
  conflictCount: number;
  tags: string[];
}

export interface Ingredient { foodId: string; weight?: number }

/** User-owned food: a dish, a custom ingredient, an override of a reference food, or a promoted free-text entry. */
export interface Food {
  id: string;                 // uuid
  name: string;
  aliases: string[];
  category: Category;
  kind: 'ingredient' | 'dish';
  ingredients: Ingredient[];  // dish only; foodIds may be 'ref:<id>' or user uuids
  fodmap: FodmapProfile;      // explicit ratings; for dishes these are derived unless overridden
  overrideFodmap: boolean;    // true = user set fodmap explicitly; false = derive from ref/ingredients
  refId: string | null;       // reference id this food overrides or was created from
  tags: string[];
  source: 'user' | 'freeText' | 'override';
  notes: string;
  favorite: boolean;
  updatedAt: number;
  deleted: 0 | 1;
}

/** Resolved view used everywhere in the UI and analysis. */
export interface FoodView {
  id: string;                 // 'ref:<id>' or uuid
  name: string;
  category: Category;
  kind: 'ingredient' | 'dish';
  fodmap: FodmapProfile;
  overall: Rating;
  groupUnknown: boolean;
  polyolType: string | null;
  servings: { low: string | null; moderate: string | null; high: string | null };
  confidence: 'high' | 'medium' | 'low' | 'user';
  conflictCount: number;
  tags: string[];
  ingredients: Ingredient[];
  ref: RefFood | null;
  user: Food | null;
  favorite: boolean;
}

export interface Entry {
  id: string;
  date: string;               // YYYY-MM-DD local
  slot: Slot;
  foodId: string;             // 'ref:<id>' or user uuid (free text is promoted to a Food on save)
  portion: Portion;
  time: string | null;        // HH:mm local, optional
  notes: string;
  createdAt: number;
  updatedAt: number;
  deleted: 0 | 1;
}

export const SYMPTOMS = ['bloating', 'pain', 'gas', 'urgency', 'diarrhea', 'constipation', 'nausea', 'reflux'] as const;
export type Symptom = (typeof SYMPTOMS)[number];
export type Exercise = 'none' | 'light' | 'moderate' | 'hard';
export const EXERCISE: Exercise[] = ['none', 'light', 'moderate', 'hard'];

export interface DayLog {
  id: string;                 // date YYYY-MM-DD
  distress: number | null;    // 0-10
  symptoms: Symptom[];
  exercise: Exercise | null;
  notes: string;
  updatedAt: number;
  deleted: 0 | 1;
}

/** Optional timestamped flare-up, for hours-scale lag analysis. */
export interface SymptomEvent {
  id: string;
  date: string;
  time: string;               // HH:mm
  severity: number;           // 0-10
  symptoms: Symptom[];
  notes: string;
  updatedAt: number;
  deleted: 0 | 1;
}

export interface Phase {
  id: string;
  name: string;
  kind: 'elimination' | 'challenge' | 'free';
  group: Group | null;
  startDate: string;
  endDate: string | null;
  notes: string;
  updatedAt: number;
  deleted: 0 | 1;
}

export interface Setting { key: string; value: string }

export type SyncTable = 'foods' | 'entries' | 'dayLogs' | 'symptomEvents' | 'phases';
export const SYNC_TABLES: SyncTable[] = ['foods', 'entries', 'dayLogs', 'symptomEvents', 'phases'];
