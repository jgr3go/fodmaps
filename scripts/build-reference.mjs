// Slim data/fodmap.json into two bundles: src/data/reference.json (searched, ~always loaded) and
// src/data/reference-details.json (notes/sources/quantitative, loaded on demand).
import { readFileSync, writeFileSync } from 'node:fs';
const { foods } = JSON.parse(readFileSync('data/fodmap.json', 'utf8'));
const tags = JSON.parse(readFileSync('data/tags.json', 'utf8')).foods;
const kw = JSON.parse(readFileSync('data/ingredient-keywords.json', 'utf8'));

const slim = foods.map((f) => ({
  id: f.id, name: f.name, aliases: f.aliases, category: f.category,
  fodmap: { fructans: f.fructans, gos: f.gos, lactose: f.lactose, fructose: f.fructose, polyols: f.polyols },
  overall: f.overall, groupUnknown: f.groupUnknown, tier: f.tier, polyolType: f.polyolType,
  lowServing: f.lowServing, moderateServing: f.moderateServing, highServing: f.highServing,
  confidence: f.confidence, conflictCount: f.conflicts.length, tags: tags[f.id] ?? [],
}));
const details = Object.fromEntries(foods.map((f) => [f.id, { conflicts: f.conflicts, notes: f.notes, sources: f.sources, quantitative: f.quantitative, sourceFamilies: f.sourceFamilies }]));
const keywords = kw.map((k) => ({ keyword: k.keyword, group: k.group ?? null, rating: k.rating ?? null, note: k.note ?? null }));

writeFileSync('src/data/reference.json', JSON.stringify(slim));
writeFileSync('src/data/reference-details.json', JSON.stringify(details));
writeFileSync('src/data/keywords.json', JSON.stringify(keywords));
console.log(`reference: ${slim.length} foods, ${keywords.length} keywords; sizes`, {
  reference: JSON.stringify(slim).length, details: JSON.stringify(details).length,
});
