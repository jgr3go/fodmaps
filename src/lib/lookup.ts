import { getSyncConfig } from './sync';
import type { FodmapProfile } from '../types';

export interface LookupResult extends FodmapProfile {
  name: string; lowServing: string | null; highServing: string | null; tags: string[];
  confidence: 'high' | 'medium' | 'low'; summary: string; sources: string[]; cached?: boolean;
}

export async function lookupFood(name: string): Promise<LookupResult> {
  const cfg = await getSyncConfig();
  if (!cfg) throw new Error('Set the sync server and token in Settings first.');
  const res = await fetch(`${cfg.apiBase}/lookup`, {
    method: 'POST', headers: { 'content-type': 'application/json', authorization: `Bearer ${cfg.token}` },
    body: JSON.stringify({ name }), signal: AbortSignal.timeout(90000),
  });
  const body = (await res.json().catch(() => ({}))) as Partial<LookupResult> & { error?: string };
  if (!res.ok) throw new Error(body.error ?? `HTTP ${res.status}`);
  return body as LookupResult;
}

export const googleUrl = (name: string) => `https://www.google.com/search?q=${encodeURIComponent(`${name} fodmap`)}`;
export const monashUrl = (name: string) => `https://www.google.com/search?q=${encodeURIComponent(`site:monashfodmap.com ${name}`)}`;
