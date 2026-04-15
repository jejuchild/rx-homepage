const express = require('express');
const db = require('../db');

const router = express.Router();

// GET /api/news — list published news (most recent first)
router.get('/news', (req, res) => {
  const limit = Math.min(parseInt(req.query.limit, 10) || 12, 50);
  const rows = db
    .prepare(
      `SELECT * FROM news
       WHERE is_published = 1
       ORDER BY date DESC, sort_order ASC
       LIMIT ?`,
    )
    .all(limit);
  res.json({ data: rows });
});

// GET /api/popups/active — single currently-active popup
router.get('/popups/active', (req, res) => {
  const today = new Date().toISOString().slice(0, 10);
  const row = db
    .prepare(
      `SELECT * FROM popups
       WHERE is_active = 1
         AND (start_date IS NULL OR start_date <= ?)
         AND (end_date   IS NULL OR end_date   >= ?)
       ORDER BY created_at DESC
       LIMIT 1`,
    )
    .get(today, today);
  res.json({ data: row || null });
});

module.exports = router;
