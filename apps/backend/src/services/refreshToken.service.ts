import { getDatabase } from '../config/database';
import crypto from 'crypto';

export class RefreshTokenService {
  private db = getDatabase();

  /**
   * Create a new refresh token row and return the token.
   */
  async create(sessionId: string, userId?: string, ttlSeconds = 60 * 60 * 24 * 30): Promise<string> {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + ttlSeconds * 1000).toISOString();

    await this.db.execute(
      `INSERT INTO refresh_tokens (token, session_id, user_id, expires_at, revoked, created_at) VALUES (?, ?, ?, ?, 0, ?)`,
      [token, sessionId, userId || null, expiresAt, new Date().toISOString()]
    );

    return token;
  }

  async findByToken(token: string) {
    return this.db.get('SELECT * FROM refresh_tokens WHERE token = ?', [token]);
  }

  async revoke(token: string) {
    await this.db.execute('UPDATE refresh_tokens SET revoked = 1 WHERE token = ?', [token]);
  }

  async revokeBySession(sessionId: string) {
    await this.db.execute('UPDATE refresh_tokens SET revoked = 1 WHERE session_id = ?', [sessionId]);
  }

  async rotate(oldToken: string, newSessionId: string) {
    // mark old token revoked; create a new token for newSessionId
    const existing = await this.findByToken(oldToken);
    if (!existing) throw new Error('Invalid refresh token');
    await this.revoke(oldToken);
    const newToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 24 * 30 * 1000).toISOString();
    await this.db.execute(
      'INSERT INTO refresh_tokens (token, session_id, user_id, expires_at, revoked, created_at) VALUES (?, ?, ?, ?, 0, ?)',
      [newToken, newSessionId, existing.user_id || null, expiresAt, new Date().toISOString()]
    );
    return newToken;
  }
}

export const refreshTokenService = new RefreshTokenService();
