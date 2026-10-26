import { getSyncConfig } from './sync';

export type RecipeAmount = 'large' | 'medium' | 'small';
export interface RecipeResult { dish: string; ingredients: { name: string; amount: RecipeAmount }[]; notes: string; cached?: boolean }

/** Ask the server (and Claude) for the standard ingredient list of a named dish. */
export async function fetchRecipe(name: string): Promise<RecipeResult> {
  const cfg = await getSyncConfig();
  if (!cfg) throw new Error('Set the sync server and token in Settings first.');
  const res = await fetch(`${cfg.apiBase}/recipe`, {
    method: 'POST', headers: { 'content-type': 'application/json', authorization: `Bearer ${cfg.token}` },
    body: JSON.stringify({ name }), signal: AbortSignal.timeout(90000),
  });
  const body = (await res.json().catch(() => ({}))) as Partial<RecipeResult> & { error?: string };
  if (!res.ok) throw new Error(body.error ?? `HTTP ${res.status}`);
  return { dish: body.dish ?? name, ingredients: Array.isArray(body.ingredients) ? body.ingredients : [], notes: body.notes ?? '', cached: body.cached };
}
