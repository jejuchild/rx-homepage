const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_PATH = path.join(DATA_DIR, 'rx.sqlite');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS news (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    title_ko      TEXT NOT NULL DEFAULT '',
    title_en      TEXT NOT NULL DEFAULT '',
    summary_ko    TEXT NOT NULL DEFAULT '',
    summary_en    TEXT NOT NULL DEFAULT '',
    category      TEXT NOT NULL DEFAULT 'News',
    date          TEXT NOT NULL,
    link_url      TEXT NOT NULL DEFAULT '',
    image_url     TEXT NOT NULL DEFAULT '',
    is_published  INTEGER NOT NULL DEFAULT 1,
    sort_order    INTEGER NOT NULL DEFAULT 0,
    created_at    TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS popups (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    title_ko      TEXT NOT NULL DEFAULT '',
    title_en      TEXT NOT NULL DEFAULT '',
    content_ko    TEXT NOT NULL DEFAULT '',
    content_en    TEXT NOT NULL DEFAULT '',
    image_url     TEXT NOT NULL DEFAULT '',
    link_url      TEXT NOT NULL DEFAULT '',
    link_text_ko  TEXT NOT NULL DEFAULT 'Learn more',
    link_text_en  TEXT NOT NULL DEFAULT 'Learn More',
    is_active     INTEGER NOT NULL DEFAULT 1,
    start_date    TEXT,
    end_date      TEXT,
    created_at    TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_news_published ON news(is_published, date DESC, sort_order);
  CREATE INDEX IF NOT EXISTS idx_popups_active ON popups(is_active);
`);

module.exports = db;
