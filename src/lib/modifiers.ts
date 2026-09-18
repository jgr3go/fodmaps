/**
 * Decompose a typed food name into a base food plus known modifiers, so "lactaid cream cheese" can inherit
 * cream cheese's ratings with lactose set to low instead of landing as "untested".
 */
import { GROUPS, type FodmapProfile, type Rating } from '../types';

export interface Modifier { key: string; label: string; patch: Partial<Record<keyof FodmapProfile, Rating | 'down'>>; removeTags?: string[]; addTags?: string[]; note: string }

export const MODIFIERS: { re: RegExp; mod: Modifier }[] = [
  { re: /\b(lactose[- ]?free|lactaid|fairlife|a2)\b/i, mod: { key: 'lactose-free', label: 'lactose-free', patch: { lactose: 'low' }, note: 'Lactose-free versions of dairy are low in lactose; the milk protein is unchanged.' } },
  { re: /\b(gluten[- ]?free|gf)\b/i, mod: { key: 'gluten-free', label: 'gluten-free', patch: { fructans: 'down' }, removeTags: ['wheat', 'gluten'], note: 'Gluten-free usually means no wheat fructans, but check for inulin, chicory root, honey or apple in the ingredients.' } },
  { re: /\b(garlic|onion)[- ]infused\b/i, mod: { key: 'infused', label: 'infused oil', patch: { fructans: 'low' }, note: 'Fructans are not oil-soluble, so infused oils are low FODMAP.' } },
  { re: /\bsourdough\b/i, mod: { key: 'sourdough', label: 'sourdough', patch: { fructans: 'down' }, note: 'Long fermentation breaks down fructans; traditional sourdough spelt or wheat is lower than yeasted bread.' } },
  { re: /\b(canned|tinned|rinsed|drained)\b/i, mod: { key: 'canned', label: 'canned & drained', patch: { gos: 'down', fructans: 'down' }, note: 'Canning leaches GOS and fructans into the liquid; drained canned legumes are lower than boiled.' } },
  { re: /\bsugar[- ]?free\b/i, mod: { key: 'sugar-free', label: 'sugar-free', patch: { polyols: 'moderate' }, addTags: ['sugar-alcohol'], note: 'Sugar-free products are often sweetened with sorbitol, xylitol or maltitol (polyols). Check the label.' } },
  { re: /\bdiet\b|\bzero sugar\b/i, mod: { key: 'diet', label: 'diet / zero sugar', patch: {}, addTags: ['artificial-sweetener'], note: 'Usually sucralose, aspartame or acesulfame; not FODMAPs but worth tracking.' } },
  { re: /\bpickled\b/i, mod: { key: 'pickled', label: 'pickled', patch: { fructans: 'down' }, addTags: ['histamine'], note: 'Pickling leaches most fructans (e.g. pickled onion or garlic) and raises histamine.' } },
];

// Words that do not change the food: brands, marketing, prep states.
const NOISE = /\b(organic|fresh|raw|plain|natural|regular|original|classic|homemade|store[- ]bought|brand|light|lite|low[- ]fat|fat[- ]free|reduced[- ]fat|whole|skim|unsweetened|sweetened|philadelphia|kraft|chobani|fage|oikos|siggi'?s|daiya|oatly|silk|almond breeze|so delicious|green valley|arla|kerrygold|tillamook|land o'? ?lakes|trader joe'?s|kirkland|great value|365|whole foods|some|a|an|the|of|with|and)\b/gi;

export interface Decomposed { base: string; modifiers: Modifier[]; changed: boolean }

export function decompose(query: string): Decomposed {
  let s = query.toLowerCase().trim();
  const modifiers: Modifier[] = [];
  for (const { re, mod } of MODIFIERS) if (re.test(s)) { modifiers.push(mod); s = s.replace(new RegExp(re.source, 'gi'), ' '); }
  const base = s.replace(NOISE, ' ').replace(/[(),]/g, ' ').replace(/\s+/g, ' ').trim();
  return { base, modifiers, changed: base !== query.toLowerCase().trim() && base.length >= 2 };
}

const RANK: Record<Exclude<Rating, null>, number> = { low: 1, moderate: 2, high: 3 };
const BY_RANK: Rating[] = [null, 'low', 'moderate', 'high'];

export function applyModifiers(profile: FodmapProfile, mods: Modifier[]): FodmapProfile {
  const out = { ...profile };
  for (const m of mods) for (const g of GROUPS) {
    const p = m.patch[g]; if (p === undefined) continue;
    if (p === 'down') { const cur = out[g]; if (cur) out[g] = BY_RANK[Math.max(1, RANK[cur] - 1)]; }
    else out[g] = p;
  }
  return out;
}

export function applyTags(tags: string[], mods: Modifier[]): string[] {
  const set = new Set(tags);
  for (const m of mods) { for (const t of m.removeTags ?? []) set.delete(t); for (const t of m.addTags ?? []) set.add(t); }
  return [...set];
}
