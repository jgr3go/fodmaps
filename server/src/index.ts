import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serve } from '@hono/node-server';
import Anthropic from '@anthropic-ai/sdk';
import { applyChanges, changesSince, counts, type Row, type Table } from './db.js';
import { summarize } from './analyze.js';

const TOKEN = process.env.API_TOKEN;
if (!TOKEN || TOKEN.length < 24) { console.error('API_TOKEN must be set (npm run token to generate one)'); process.exit(1); }
const ORIGINS = (process.env.ALLOWED_ORIGINS ?? 'http://localhost:5173').split(',').map((s) => s.trim());
const PORT = Number(process.env.PORT ?? 8787);

const app = new Hono();
app.use('*', cors({ origin: ORIGINS, allowHeaders: ['authorization', 'content-type'], allowMethods: ['GET', 'POST', 'OPTIONS'], maxAge: 86400 }));
app.get('/health', (c) => c.json({ ok: true, counts: counts() }));

app.use('*', async (c, next) => {
  if (c.req.method === 'OPTIONS' || c.req.path === '/health') return next();
  const auth = c.req.header('authorization') ?? '';
  const given = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (given.length !== TOKEN.length || !timingSafeEqual(given, TOKEN)) return c.json({ error: 'unauthorized' }, 401);
  return next();
});

function timingSafeEqual(a: string, b: string): boolean {
  let r = 0; for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i); return r === 0;
}

app.post('/sync', async (c) => {
  const body = (await c.req.json().catch(() => null)) as { since?: number; changes?: Partial<Record<Table, Row[]>> } | null;
  if (!body) return c.json({ error: 'bad json' }, 400);
  const now = Date.now();
  const accepted = applyChanges(body.changes ?? {}, now);
  const changes = changesSince(Number(body.since ?? 0));
  return c.json({ now, accepted, changes });
});

app.post('/analyze', async (c) => {
  const digest = await c.req.json().catch(() => null);
  if (!digest) return c.json({ error: 'bad json' }, 400);
  try {
    return c.json({ text: await summarize(digest) });
  } catch (e) {
    if (e instanceof Anthropic.AuthenticationError) return c.json({ error: 'server is missing a valid ANTHROPIC_API_KEY' }, 500);
    if (e instanceof Anthropic.RateLimitError) return c.json({ error: 'rate limited, try again in a minute' }, 429);
    if (e instanceof Anthropic.APIError) return c.json({ error: `model API error ${e.status}` }, 502);
    return c.json({ error: (e as Error).message }, 500);
  }
});

serve({ fetch: app.fetch, port: PORT, hostname: '127.0.0.1' }, () => console.log(`gutlog-api on 127.0.0.1:${PORT}, origins ${ORIGINS.join(', ')}`));
