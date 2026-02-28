-- 保存的计算记录（短链接分享）
CREATE TABLE IF NOT EXISTS saved_records (
  id TEXT PRIMARY KEY,
  input_json TEXT NOT NULL,
  summary_json TEXT NOT NULL,
  label TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_saved_records_created ON saved_records(created_at);

-- 用户反馈
CREATE TABLE IF NOT EXISTS feedback (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  content TEXT NOT NULL,
  contact TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);
