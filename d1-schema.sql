DROP TABLE IF EXISTS messages;

CREATE TABLE messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT,
  group_name TEXT,
  message TEXT,
  translated_message TEXT,
  language TEXT,
  tone TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
