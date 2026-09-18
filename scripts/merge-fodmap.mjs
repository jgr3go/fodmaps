// Merge research/*.json into data/fodmap.json + data/ingredient-keywords.json + data/SOURCES.md
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const RESEARCH = join(ROOT, 'research');
const DATA = join(ROOT, 'data');
const GROUPS = ['fructans', 'gos', 'lactose', 'fructose', 'polyols'];
const RANK = { high: 3, moderate: 2, low: 1 };
// Rating priority: Monash's own public statements first (they are the reference lab), then
// literature-derived values, then clinical handouts (often older Monash data), then community sets.
const PRIORITY = ['monash-public', 'literature', 'clinical-handouts', 'open-datasets'];
// Serving priority: literature servings are computed from sparse/abstract data and are least reliable.
const SERVING_PRIORITY = ['monash-public', 'clinical-handouts', 'open-datasets', 'literature'];
const BAD_SERVING = /^any \(no FODMAP detected/i;

const norm = (s) => String(s ?? '').toLowerCase().trim().replace(/\s+/g, ' ').replace(/[’']/g, "'");
const singular = (s) => /(us|ss|is|os)$/.test(s) ? s : s.replace(/ies$/, 'y').replace(/(ch|sh|s|x|z)es$/, '$1').replace(/([^s])s$/, '$1');
const key = (s) => singular(norm(s));

const files = readdirSync(RESEARCH).filter((f) => f.endsWith('.json'));
// Every primary food name across all sources. An alias that is also a primary name somewhere is NOT
// used for merging, so a generic entry like "meat (plain)" with aliases [beef, chicken, fish] cannot
// swallow the real beef/chicken/fish records.
const primaryNames = new Set();
for (const f of files) {
  try { for (const food of JSON.parse(readFileSync(join(RESEARCH, f), 'utf8')).foods ?? []) if (food?.name) primaryNames.add(key(food.name)); } catch {}
}
const MAX_ALIASES_FOR_MERGE = 8; // longer lists are category groupings, not synonyms
const sources = [];
const merged = new Map(); // key -> record
const aliasIndex = new Map(); // alias key -> canonical key
let keywords = [];
let datasets = [];

function findCanonical(name, aliases) {
  const k = key(name);
  if (merged.has(k)) return k;
  if (aliasIndex.has(k)) return aliasIndex.get(k);
  if ((aliases ?? []).length <= MAX_ALIASES_FOR_MERGE) {
    for (const a of aliases ?? []) {
      const ak = key(a);
      if (primaryNames.has(ak) && ak !== k) continue; // real food elsewhere, don't merge through it
      if (merged.has(ak)) return ak;
    }
  }
  return null;
}

for (const f of files) {
  let doc;
  try { doc = JSON.parse(readFileSync(join(RESEARCH, f), 'utf8')); }
  catch (e) { console.error(`skip ${f}: ${e.message}`); continue; }
  const family = doc.source?.family ?? f.replace('.json', '');
  sources.push({ family, file: f, ...doc.source, foodCount: doc.foods?.length ?? 0 });
  if (doc.ingredientKeywords) keywords.push(...doc.ingredientKeywords.map((k) => ({ ...k, family })));
  if (doc.datasets) datasets.push(...doc.datasets);

  for (const food of doc.foods ?? []) {
    if (!food?.name) continue;
    const k = findCanonical(food.name, food.aliases) ?? key(food.name);
    let rec = merged.get(k);
    if (!rec) {
      rec = {
        id: k.replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        name: norm(food.name),
        aliases: new Set(),
        category: food.category ?? 'other',
        votes: Object.fromEntries(GROUPS.map((g) => [g, []])),
        polyolType: new Set(),
        servings: { low: [], moderate: [], high: [] },
        notes: [],
        quantitative: null,
        sources: [],
        disagreements: [],
      };
      merged.set(k, rec);
    }
    const mergeable = (food.aliases ?? []).length <= MAX_ALIASES_FOR_MERGE;
    for (const a of [food.name, ...(food.aliases ?? [])]) {
      const ak = key(a);
      if (ak === k) continue;
      rec.aliases.add(norm(a)); // keep for search
      if (mergeable && !primaryNames.has(ak)) aliasIndex.set(ak, k); // only synonyms drive merging
    }
    if (rec.category === 'other' && food.category) rec.category = food.category;
    for (const g of GROUPS) {
      const v = food[g];
      if (v === 'high' || v === 'moderate' || v === 'low') rec.votes[g].push({ family, rating: v });
    }
    if (food.polyolType) rec.polyolType.add(food.polyolType);
    if (food.lowServing && !BAD_SERVING.test(food.lowServing)) rec.servings.low.push({ family, text: food.lowServing });
    if (food.moderateServing) rec.servings.moderate.push({ family, text: food.moderateServing });
    if (food.highServing) rec.servings.high.push({ family, text: food.highServing });
    if (food.notes) rec.notes.push(`[${family}] ${food.notes}`);
    if (food.quantitative && !rec.quantitative) rec.quantitative = food.quantitative;
    if (food.disagreements?.length) rec.disagreements.push(...food.disagreements.map((d) => `[${family}] ${d}`));
    if (food.sourceUrl) rec.sources.push({ family, url: food.sourceUrl });
  }
}

function resolve(votes) {
  if (!votes.length) return { rating: null, agreement: 0, conflict: false };
  const ratings = new Set(votes.map((v) => v.rating));
  const conflict = ratings.size > 1;
  // Pick highest-priority family's vote; tie-break toward the more cautious (higher) rating.
  const sorted = [...votes].sort((a, b) =>
    PRIORITY.indexOf(a.family) - PRIORITY.indexOf(b.family) || RANK[b.rating] - RANK[a.rating]);
  return { rating: sorted[0].rating, agreement: votes.length, conflict };
}

const pickServing = (arr) => arr.length ? arr.sort((a, b) => SERVING_PRIORITY.indexOf(a.family) - SERVING_PRIORITY.indexOf(b.family))[0].text : null;

const out = [...merged.values()].map((r) => {
  const ratings = {}; let maxAgreement = 0; const conflicts = [];
  for (const g of GROUPS) {
    const { rating, agreement, conflict } = resolve(r.votes[g]);
    ratings[g] = rating; maxAgreement = Math.max(maxAgreement, agreement);
    if (conflict) conflicts.push(`${g}: ${r.votes[g].map((v) => `${v.family}=${v.rating}`).join(', ')}`);
  }
  const worst = Math.max(0, ...GROUPS.map((g) => RANK[ratings[g]] ?? 0));
  let overall = worst === 3 ? 'high' : worst === 2 ? 'moderate' : worst === 1 ? 'low' : null;
  let groupUnknown = false;
  if (!overall) {
    // Source rated the food without attributing a FODMAP group. Infer direction from servings.
    const hasLow = r.servings.low.length > 0, hasHigh = r.servings.high.length > 0;
    if (hasHigh && !hasLow) overall = 'high';
    else if (hasLow && hasHigh) overall = 'moderate';
    else if (hasLow) overall = 'low';
    groupUnknown = !!overall;
  }
  const families = new Set(r.sources.map((s) => s.family));
  const tier = families.has('monash-public') || families.has('clinical-handouts') || families.has('open-datasets') ? 'primary' : 'variant';
  return {
    id: r.id,
    name: r.name,
    aliases: [...r.aliases].sort(),
    category: r.category,
    ...ratings,
    overall,               // worst group rating; null = untested / unknown
    groupUnknown,          // true when overall was inferred from serving text, no group named
    tier,                  // 'variant' = literature-only lab sample (regional bread etc.), search these last
    polyolType: [...r.polyolType].join('/') || null,
    lowServing: pickServing(r.servings.low),
    moderateServing: pickServing(r.servings.moderate),
    highServing: pickServing(r.servings.high),
    quantitative: r.quantitative,
    confidence: families.size >= 3 ? 'high' : families.size === 2 ? 'medium' : 'low',
    sourceFamilies: [...families].sort(),
    conflicts: [...conflicts, ...r.disagreements],
    notes: r.notes,
    sources: r.sources,
  };
}).sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));

// dedupe keywords by keyword text
const kwMap = new Map();
for (const k of keywords) if (k?.keyword && !kwMap.has(norm(k.keyword))) kwMap.set(norm(k.keyword), { ...k, keyword: norm(k.keyword) });

writeFileSync(join(DATA, 'fodmap.json'), JSON.stringify({ generated: new Date().toISOString().slice(0, 10), count: out.length, foods: out }, null, 2));
writeFileSync(join(DATA, 'ingredient-keywords.json'), JSON.stringify([...kwMap.values()], null, 2));

const byCat = out.reduce((m, f) => ((m[f.category] = (m[f.category] ?? 0) + 1), m), {});
const untested = out.filter((f) => !f.overall).length;
const byConf = out.reduce((m, f) => ((m[f.confidence] = (m[f.confidence] ?? 0) + 1), m), {});
const conflicted = out.filter((f) => f.conflicts.length);
const md = [
  '# FODMAP reference table: sources and provenance', '',
  `Generated ${new Date().toISOString().slice(0, 10)} by scripts/merge-fodmap.mjs from research/*.json.`, '',
  'Ratings are compiled from public sources only (no Monash app data). Every food carries its source URLs.',
  'When sources disagree, priority is: Monash public statements > quantitative literature > clinical handouts > open datasets, tie-breaking toward the more cautious rating. Serving text prefers Monash public, then handouts, with literature-derived servings last. Conflicts are kept on the record.', '',
  '## Source families', '',
  '| Family | File | Foods | Notes |', '|---|---|---|---|',
  ...sources.map((s) => `| ${s.family} | ${s.file} | ${s.foodCount} | ${(s.notes ?? '').replace(/\|/g, '/').slice(0, 200)} |`), '',
  '## Coverage', '',
  `Total foods: **${out.length}** (${untested} untested/unrated, kept so the app can flag them as unknown rather than silently "low")`, '',
  '| Category | Count |', '|---|---|', ...Object.entries(byCat).sort().map(([c, n]) => `| ${c} | ${n} |`), '',
  '| Confidence (source families agreeing) | Count |', '|---|---|', ...Object.entries(byConf).map(([c, n]) => `| ${c} | ${n} |`), '',
  `## Foods with conflicting ratings (${conflicted.length})`, '',
  ...conflicted.map((f) => `- **${f.name}**: ${f.conflicts.join('; ')}`), '',
  datasets.length ? '## Open datasets evaluated\n\n| Name | License | Provenance | Usable |\n|---|---|---|---|\n' +
    datasets.map((d) => `| [${d.name}](${d.url}) | ${d.license ?? '?'} | ${(d.provenance ?? '').replace(/\|/g, '/')} | ${d.usable ? 'yes' : 'no'} |`).join('\n') : '',
  '', '## All source URLs', '',
  ...[...new Set(sources.flatMap((s) => s.urls ?? []))].map((u) => `- ${u}`),
].join('\n');
writeFileSync(join(DATA, 'SOURCES.md'), md);

console.log(`merged ${out.length} foods from ${files.length} files; ${conflicted.length} with conflicts; ${kwMap.size} keywords`);
console.log(byCat);
