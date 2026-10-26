import Anthropic from '@anthropic-ai/sdk';
import { db } from './db.js';

const client = new Anthropic();
db.exec(`CREATE TABLE IF NOT EXISTS recipes (name TEXT PRIMARY KEY, body TEXT NOT NULL, createdAt INTEGER NOT NULL)`);
const getCached = db.prepare('SELECT body FROM recipes WHERE name = ?');
const putCached = db.prepare('INSERT OR REPLACE INTO recipes (name, body, createdAt) VALUES (?, ?, ?)');

export type Amount = 'large' | 'medium' | 'small';
export interface RecipeIngredient { name: string; amount: Amount }
export interface Recipe { dish: string; ingredients: RecipeIngredient[]; notes: string }

const SYSTEM = `You list the ingredients of a named dish for a personal gut-symptom tracker (FODMAP elimination diet). The user
typed a dish name; give the ingredients of its standard, most common recipe as cooked at home or served in a typical
restaurant. Answer with ONE JSON object and nothing else:
{"dish": string, "ingredients": [{"name": string, "amount": "large"|"medium"|"small"}], "notes": string}
name: a plain lowercase ingredient as it would appear in a food database ("rice noodles", "garlic", "shallot", "fish
sauce", "tamarind paste", "palm sugar", "egg", "firm tofu", "shrimp", "bean sprouts", "peanuts", "lime", "garlic
chives"). One ingredient per item, no quantities, no preparation words ("chopped", "fresh"), no brand names. Expand
composite components into their ingredients when they matter for FODMAPs (a curry paste -> garlic, shallot, galangal,
lemongrass...; a bun -> wheat flour; a cream sauce -> cream, butter, wheat flour).
amount: "large" for the bulk components (the starch, the main protein), "medium" for ordinary vegetables and sauces,
"small" for seasonings, garnishes and oils. ALWAYS include garlic, onion, shallot, leek, wheat, dairy, honey, high
fructose corn syrup, inulin, apple, pear, mushrooms, beans and sweeteners when the standard recipe has them, however
small the amount: these are the ingredients the user is tracking.
Keep it to the 6 to 20 ingredients a standard version actually contains; do not pad with optional extras. If the name
is a single plain ingredient, a brand, or something you do not recognise as a dish, return an empty ingredients array
and say why in notes. notes: one short sentence naming the variant you described and any common substitution
(e.g. "Restaurant pad thai; many places add sugar or ketchup and some use tofu instead of shrimp.").`;

export async function recipe(rawName: string): Promise<Recipe & { cached: boolean }> {
  const name = rawName.trim().toLowerCase().replace(/\s+/g, ' ').slice(0, 80);
  const hit = getCached.get(name) as { body: string } | undefined;
  if (hit) return { ...(JSON.parse(hit.body) as Recipe), cached: true };

  const msg = await client.beta.messages.create({
    model: 'claude-opus-5-5',
    max_tokens: 4000,
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    system: [{ type: 'text', text: SYSTEM, cache_control: { type: 'ephemeral' } }],
    output_config: { effort: 'low' },
    messages: [{ role: 'user', content: `Dish: ${name}` }],
  });
  if (msg.stop_reason === 'refusal') throw new Error('The model declined this request.');
  const text = msg.content.filter((b): b is Anthropic.Beta.BetaTextBlock => b.type === 'text').map((b) => b.text).join('\n');
  const json = text.match(/\{[\s\S]*\}/)?.[0];
  if (!json) throw new Error('No JSON in model response');
  const parsed = validate(JSON.parse(json), name);
  putCached.run(name, JSON.stringify(parsed), Date.now());
  return { ...parsed, cached: false };
}

const AMOUNTS = new Set<Amount>(['large', 'medium', 'small']);
function validate(o: Record<string, unknown>, name: string): Recipe {
  const seen = new Set<string>();
  const ingredients: RecipeIngredient[] = [];
  for (const it of Array.isArray(o.ingredients) ? o.ingredients : []) {
    const n = typeof it?.name === 'string' ? it.name.trim().toLowerCase().replace(/\s+/g, ' ').slice(0, 60) : '';
    if (!n || seen.has(n)) continue;
    seen.add(n);
    ingredients.push({ name: n, amount: AMOUNTS.has(it.amount) ? (it.amount as Amount) : 'medium' });
    if (ingredients.length >= 30) break;
  }
  return {
    dish: typeof o.dish === 'string' && o.dish.trim() ? o.dish.trim().slice(0, 80) : name,
    ingredients,
    notes: typeof o.notes === 'string' ? o.notes.trim().slice(0, 300) : '',
  };
}
