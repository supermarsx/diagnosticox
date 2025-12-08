import { getDatabase } from '../config/database';

export async function up() {
  const db = getDatabase();

  // SQLite does not support IF NOT EXISTS on ALTER COLUMN; wrap in try/catch.
  try {
    await db.execute(`ALTER TABLE facts ADD COLUMN updated_at TEXT DEFAULT (datetime('now'))`);
  } catch (error: any) {
    if (!`${error.message}`.includes('duplicate column name')) {
      throw error;
    }
  }

  // Backfill updated_at where null
  await db.execute(
    `UPDATE facts SET updated_at = COALESCE(updated_at, created_at, measured_at)`
  );
}

export async function down() {
  // No-op: column drop skipped for safety across sqlite/postgres.
}
