const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// All admin routes require authentication
router.use(requireAuth);

/* ─── News ───────────────────────────────────────────────── */

const NEWS_FIELDS = [
  'title_ko', 'title_en', 'summary_ko', 'summary_en',
  'category', 'date', 'link_url', 'image_url',
  'is_published', 'sort_order',
];

function pickNews(body) {
  const out = {};
  for (const k of NEWS_FIELDS) {
    if (body[k] !== undefined) out[k] = body[k];
  }
  if (out.is_published !== undefined) out.is_published = out.is_published ? 1 : 0;
  return out;
}

router.get('/news', (req, res) => {
  const rows = db
    .prepare('SELECT * FROM news ORDER BY date DESC, sort_order ASC')
    .all();
  res.json({ data: rows });
});

router.get('/news/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM news WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json({ data: row });
});

router.post('/news', (req, res) => {
  const data = pickNews(req.body || {});
  if (!data.date) return res.status(400).json({ error: 'date is required' });
  const cols = Object.keys(data);
  const stmt = db.prepare(
    `INSERT INTO news (${cols.join(', ')}) VALUES (${cols.map(() => '?').join(', ')})`,
  );
  const result = stmt.run(...cols.map((k) => data[k]));
  res.json({ id: result.lastInsertRowid });
});

router.put('/news/:id', (req, res) => {
  const data = pickNews(req.body || {});
  const cols = Object.keys(data);
  if (cols.length === 0) return res.status(400).json({ error: 'No fields to update' });
  const sets = cols.map((c) => `${c} = ?`).join(', ');
  const stmt = db.prepare(`UPDATE news SET ${sets}, updated_at = datetime('now') WHERE id = ?`);
  const result = stmt.run(...cols.map((k) => data[k]), req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Not found' });
  res.json({ ok: true });
});

router.patch('/news/:id/publish', (req, res) => {
  const value = req.body && req.body.is_published ? 1 : 0;
  const result = db
    .prepare("UPDATE news SET is_published = ?, updated_at = datetime('now') WHERE id = ?")
    .run(value, req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Not found' });
  res.json({ ok: true });
});

router.delete('/news/:id', (req, res) => {
  const result = db.prepare('DELETE FROM news WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Not found' });
  res.json({ ok: true });
});

/* ─── Popups ─────────────────────────────────────────────── */

const POPUP_FIELDS = [
  'title_ko', 'title_en', 'content_ko', 'content_en',
  'image_url', 'link_url', 'link_text_ko', 'link_text_en',
  'is_active', 'start_date', 'end_date',
];

function pickPopup(body) {
  const out = {};
  for (const k of POPUP_FIELDS) {
    if (body[k] !== undefined) out[k] = body[k];
  }
  if (out.is_active !== undefined) out.is_active = out.is_active ? 1 : 0;
  return out;
}

router.get('/popups', (req, res) => {
  const rows = db.prepare('SELECT * FROM popups ORDER BY created_at DESC').all();
  res.json({ data: rows });
});

router.get('/popups/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM popups WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json({ data: row });
});

router.post('/popups', (req, res) => {
  const data = pickPopup(req.body || {});
  const cols = Object.keys(data);
  if (cols.length === 0) return res.status(400).json({ error: 'No fields' });
  const stmt = db.prepare(
    `INSERT INTO popups (${cols.join(', ')}) VALUES (${cols.map(() => '?').join(', ')})`,
  );
  const result = stmt.run(...cols.map((k) => data[k]));
  res.json({ id: result.lastInsertRowid });
});

router.put('/popups/:id', (req, res) => {
  const data = pickPopup(req.body || {});
  const cols = Object.keys(data);
  if (cols.length === 0) return res.status(400).json({ error: 'No fields to update' });
  const sets = cols.map((c) => `${c} = ?`).join(', ');
  const stmt = db.prepare(`UPDATE popups SET ${sets}, updated_at = datetime('now') WHERE id = ?`);
  const result = stmt.run(...cols.map((k) => data[k]), req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Not found' });
  res.json({ ok: true });
});

router.patch('/popups/:id/active', (req, res) => {
  const value = req.body && req.body.is_active ? 1 : 0;
  const result = db
    .prepare("UPDATE popups SET is_active = ?, updated_at = datetime('now') WHERE id = ?")
    .run(value, req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Not found' });
  res.json({ ok: true });
});

router.delete('/popups/:id', (req, res) => {
  const result = db.prepare('DELETE FROM popups WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Not found' });
  res.json({ ok: true });
});

module.exports = router;
