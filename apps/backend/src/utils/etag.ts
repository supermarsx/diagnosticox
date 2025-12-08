import crypto from 'crypto';

/**
 * Generate a stable ETag for a row using id + updated_at (and optionally other fields).
 * Keeps concurrency control lightweight without pulling in additional deps.
 */
export function generateEtag(record: { id?: string; updated_at?: string }): string {
  const input = `${record.id || ''}:${record.updated_at || ''}`;
  return crypto.createHash('sha256').update(input).digest('base64');
}
