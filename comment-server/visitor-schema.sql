CREATE TABLE IF NOT EXISTS site_visitors (
  id TEXT PRIMARY KEY,
  first_seen TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS site_metrics (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  views INTEGER NOT NULL DEFAULT 0,
  visitors INTEGER NOT NULL DEFAULT 0,
  today_date TEXT NOT NULL,
  today_views INTEGER NOT NULL DEFAULT 0,
  since TEXT NOT NULL
);

INSERT OR IGNORE INTO site_metrics (id, today_date, since)
VALUES (1, date('now', '+8 hours'), date('now', '+8 hours'));
