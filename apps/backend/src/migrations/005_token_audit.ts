import { getDatabase } from '../config/database';

export async function up() {
  const db = getDatabase();

  await db.execute(`
    CREATE TABLE IF NOT EXISTS token_audit (
      id TEXT PRIMARY KEY,
      event_type TEXT NOT NULL,
      token TEXT,
      session_id TEXT,
      user_id TEXT,
      details TEXT DEFAULT '{}',
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  await db.execute(`CREATE INDEX IF NOT EXISTS idx_token_audit_session ON token_audit (session_id)`);
  await db.execute(`CREATE INDEX IF NOT EXISTS idx_token_audit_user ON token_audit (user_id)`);
}

export async function down() {
  const db = getDatabase();
  await db.execute('DROP INDEX IF EXISTS idx_token_audit_session');
  await db.execute('DROP INDEX IF EXISTS idx_token_audit_user');
  await db.execute('DROP TABLE IF EXISTS token_audit');
}
