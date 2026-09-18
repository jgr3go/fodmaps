import Anthropic from '@anthropic-ai/sdk';
import { db } from './db.js';

const client = new Anthropic();
db.exec(`CREATE TABLE IF NOT EXISTS lookups (name TEXT PRIMARY KEY, body TEXT NOT NULL, createdAt INTEGER NOT NULL)`);
const getCached = db.prepare('SELECT body FROM lookups WHERE name = ?');
const putCached = db.prepare('INSERT OR REPLACE INTO lookups (name, body, createdAt) VALUES (?, ?, ?)');

type Rating = 'high' | 'moderate' | 'low' | null;
export interface Lookup {
  name: string; fructans: Rating; gos: Rating; lactose: Rating; fructose: Rating; polyols: Rating;
  lowServing: string | null; highServing: string | null; tags: string[]; confidence: 'high' | 'medium' | 'low'; summary: string; sources: string[];
}

const SYSTEM = `You look up the FODMAP profile of one food for a personal symptom-tracking app. Use web search (Monash FODMAP
blog, FODMAP Friendly, university or hospital dietitian handouts, peer-reviewed composition data) and answer with ONE JSON
object and nothing else, in this exact shape:
{"name": string, "fructans": R, "gos": R, "lactose": R, "fructose": R, "polyols": R,
 "lowServing": string|null, "highServing": string|null,
 "tags": string[], "confidence": "high"|"medium"|"low", "summary": string, "sources": string[]}
where R is "high" | "moderate" | "low" | null. null means the food is not a meaningful source of that group. Rate at a
typical serving. "fructose" means EXCESS fructose (fructose beyond glucose). For a branded or processed product, reason
from its usual ingredient list and say so in summary. tags may only include: milk, egg, peanut, tree-nut, soy, wheat,
gluten, fish, shellfish, sesame, histamine, caffeine, high-fat, alcohol, spicy, nightshade, sugar-alcohol,
artificial-sweetener. confidence is high only when a lab-tested source (Monash or FODMAP Friendly) states it. summary is
two sentences max, plain English, naming the deciding ingredient. sources are the URLs you actually used. Never invent a
source. If you cannot find anything, set every rating to null, confidence low, and explain in summary.`;

export async function lookup(rawName: string): Promise<Lookup & { cached: boolean }> {
  const name = rawName.trim().toLowerCase().replace(/\s+/g, ' ').slice(0, 80);
  const hit = getCached.get(name) as { body: string } | undefined;
  if (hit) return { ...(JSON.parse(hit.body) as Lookup), cached: true };

  const stream = client.messages.stream({
    model: 'claude-opus-5',
    max_tokens: 6000,
    system: [{ type: 'text', text: SYSTEM, cache_control: { type: 'ephemeral' } }],
    tools: [{ type: 'web_search_20260209', name: 'web_search', max_uses: 4 }],
    output_config: { effort: 'medium' },
    messages: [{ role: 'user', content: `Food: ${name}` }],
  });
  const msg = await stream.finalMessage();
  if (msg.stop_reason === 'refusal') throw new Error('The model declined this lookup.');
  const text = msg.content.filter((b): b is Anthropic.TextBlock => b.type === 'text').map((b) => b.text).join('\n');
  const json = text.match(/\{[\s\S]*\}/)?.[0];
  if (!json) throw new Error('No JSON in model response');
  const parsed = validate(JSON.parse(json), name);
  putCached.run(name, JSON.stringify(parsed), Date.now());
  return { ...parsed, cached: false };
}

const RATINGS = new Set(['high', 'moderate', 'low']);
const TAGS = new Set(['milk', 'egg', 'peanut', 'tree-nut', 'soy', 'wheat', 'gluten', 'fish', 'shellfish', 'sesame', 'histamine', 'caffeine', 'high-fat', 'alcohol', 'spicy', 'nightshade', 'sugar-alcohol', 'artificial-sweetener']);
function validate(o: Record<string, unknown>, name: string): Lookup {
  const r = (v: unknown): Rating => (typeof v === 'string' && RATINGS.has(v) ? (v as Rating) : null);
  const s = (v: unknown): string | null => (typeof v === 'string' && v.trim() ? v.trim().slice(0, 200) : null);
  return {
    name, fructans: r(o.fructans), gos: r(o.gos), lactose: r(o.lactose), fructose: r(o.fructose), polyols: r(o.polyols),
    lowServing: s(o.lowServing), highServing: s(o.highServing),
    tags: Array.isArray(o.tags) ? o.tags.filter((t): t is string => typeof t === 'string' && TAGS.has(t)) : [],
    confidence: o.confidence === 'high' || o.confidence === 'medium' ? o.confidence : 'low',
    summary: s(o.summary) ?? '', sources: Array.isArray(o.sources) ? o.sources.filter((u): u is string => typeof u === 'string' && /^https?:\/\//.test(u)).slice(0, 5) : [],
  };
}
