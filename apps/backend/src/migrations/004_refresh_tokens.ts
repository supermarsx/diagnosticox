import { getDatabase } from '../config/database';

export async function up() {
  const db = getDatabase();

  // refresh_tokens table: stores persistent refresh tokens mapped to a session
  await db.execute(`
    CREATE TABLE IF NOT EXISTS refresh_tokens (
      token TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      user_id TEXT,
      expires_at TEXT,
      revoked INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  await db.execute(`CREATE INDEX IF NOT EXISTS idx_refresh_tokens_session ON refresh_tokens (session_id)`);
  await db.execute(`CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user ON refresh_tokens (user_id)`);
}

export async function down() {
  const db = getDatabase();
  await db.execute('DROP INDEX IF EXISTS idx_refresh_tokens_session');
  await db.execute('DROP INDEX IF EXISTS idx_refresh_tokens_user');
  await db.execute('DROP TABLE IF EXISTS refresh_tokens');
}
