import { Hono } from 'hono';
import { cors } from 'hono/cors';

type Env = {
  DB: D1Database;
  ENVIRONMENT?: string;
};

const app = new Hono<{ Bindings: Env }>();

app.use('*', cors({
  origin: [
    'https://cashcalc.cn',
    'https://www.cashcalc.cn',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
  ],
  allowMethods: ['GET', 'POST', 'OPTIONS'],
  allowHeaders: ['Content-Type'],
}));

app.get('/api/v1/health', (c) => c.json({ ok: true, ts: Date.now() }));

// 保存计算记录，返回短 ID
app.post('/api/v1/save', async (c) => {
  try {
    const body = await c.req.json<{
      input: Record<string, unknown>;
      summary: Record<string, unknown>;
      label?: string;
    }>();

    if (!body?.input || !body?.summary) {
      return c.json({ error: 'Missing input or summary' }, 400);
    }

    const id = genShortId();
    const inputJson = JSON.stringify(body.input);
    const summaryJson = JSON.stringify(body.summary);
    const label = body.label ?? null;

    await c.env.DB.prepare(
      'INSERT INTO saved_records (id, input_json, summary_json, label) VALUES (?, ?, ?, ?)'
    )
      .bind(id, inputJson, summaryJson, label)
      .run();

    return c.json({ id, url: `/s/${id}` });
  } catch (e) {
    console.error('save error:', e);
    return c.json({ error: 'Failed to save' }, 500);
  }
});

// 根据短 ID 加载记录
app.get('/api/v1/save/:id', async (c) => {
  const id = c.req.param('id');
  if (!id || id.length > 16) {
    return c.json({ error: 'Invalid id' }, 400);
  }

  try {
    const row = await c.env.DB.prepare(
      'SELECT input_json, summary_json, label, created_at FROM saved_records WHERE id = ?'
    )
      .bind(id)
      .first<{ input_json: string; summary_json: string; label: string | null; created_at: number }>();

    if (!row) {
      return c.json({ error: 'Not found' }, 404);
    }

    return c.json({
      input: JSON.parse(row.input_json),
      summary: JSON.parse(row.summary_json),
      label: row.label,
      createdAt: row.created_at,
    });
  } catch (e) {
    console.error('load error:', e);
    return c.json({ error: 'Failed to load' }, 500);
  }
});

// 用户反馈
app.post('/api/v1/feedback', async (c) => {
  try {
    const body = await c.req.json<{ content: string; contact?: string }>();

    if (!body?.content || typeof body.content !== 'string') {
      return c.json({ error: 'Missing content' }, 400);
    }

    const content = String(body.content).slice(0, 2000);
    const contact = body.contact ? String(body.contact).slice(0, 200) : null;

    await c.env.DB.prepare(
      'INSERT INTO feedback (content, contact) VALUES (?, ?)'
    )
      .bind(content, contact)
      .run();

    return c.json({ ok: true });
  } catch (e) {
    console.error('feedback error:', e);
    return c.json({ error: 'Failed to submit' }, 500);
  }
});

function genShortId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => chars[b % chars.length]).join('');
}

export default app;
