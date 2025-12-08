import { getDatabase } from '../config/database';
import crypto from 'crypto';

export class RefreshTokenService {
  private db = getDatabase();

  /**
   * Create a new refresh token row and return the token.
   */
  async create(sessionId: string, userId?: string, ttlSeconds = 60 * 60 * 24 * 30): Promise<string> {
    // create a tracing span for refresh token lifecycle
    try {
      const api = await import('@opentelemetry/api');
      const tracer = api.trace.getTracer('diagnosticox-auth');
      return tracer.startActiveSpan('refresh_token.create', { attributes: { sessionId, userId } }, async (span: any) => {
        try {
          const token = crypto.randomBytes(32).toString('hex');
          const expiresAt = new Date(Date.now() + ttlSeconds * 1000).toISOString();

          await this.db.execute(
            `INSERT INTO refresh_tokens (token, session_id, user_id, expires_at, revoked, created_at) VALUES (?, ?, ?, ?, 0, ?)`,
            [token, sessionId, userId || null, expiresAt, new Date().toISOString()]
          );

          // audit
          await this.db.execute(
            'INSERT INTO token_audit (id, event_type, token, session_id, user_id, details, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [crypto.randomUUID(), 'create', token, sessionId, userId || null, JSON.stringify({ ttlSeconds }), new Date().toISOString()]
          );

          return token;
        } catch (err) {
          span.recordException(err);
          throw err;
        } finally {
          span.end();
        }
      });
    } catch (err) {
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + ttlSeconds * 1000).toISOString();

      await this.db.execute(
        `INSERT INTO refresh_tokens (token, session_id, user_id, expires_at, revoked, created_at) VALUES (?, ?, ?, ?, 0, ?)`,
        [token, sessionId, userId || null, expiresAt, new Date().toISOString()]
      );

      // audit
      await this.db.execute(
        'INSERT INTO token_audit (id, event_type, token, session_id, user_id, details, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [crypto.randomUUID(), 'create', token, sessionId, userId || null, JSON.stringify({ ttlSeconds }), new Date().toISOString()]
      );

      return token;
    }
    const expiresAt = new Date(Date.now() + ttlSeconds * 1000).toISOString();

    await this.db.execute(
      `INSERT INTO refresh_tokens (token, session_id, user_id, expires_at, revoked, created_at) VALUES (?, ?, ?, ?, 0, ?)`,
      [token, sessionId, userId || null, expiresAt, new Date().toISOString()]
    );

    // audit
    await this.db.execute(
      'INSERT INTO token_audit (id, event_type, token, session_id, user_id, details, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [crypto.randomUUID(), 'create', token, sessionId, userId || null, JSON.stringify({ ttlSeconds }), new Date().toISOString()]
    );

    return token;
  }

  async findByToken(token: string) {
    return this.db.get('SELECT * FROM refresh_tokens WHERE token = ?', [token]);
  }

  async revoke(token: string) {
    try {
      const api = await import('@opentelemetry/api');
      const tracer = api.trace.getTracer('diagnosticox-auth');
      await tracer.startActiveSpan('refresh_token.revoke', { attributes: { token } }, async (span: any) => {
        try {
          await this.db.execute('UPDATE refresh_tokens SET revoked = 1 WHERE token = ?', [token]);
          await this.db.execute('INSERT INTO token_audit (id, event_type, token, created_at) VALUES (?, ?, ?, ?)', [crypto.randomUUID(), 'revoke', token, new Date().toISOString()]);
        } catch (err) {
          span.recordException(err);
          throw err;
        } finally {
          span.end();
        }
      });
    } catch (err) {
      await this.db.execute('UPDATE refresh_tokens SET revoked = 1 WHERE token = ?', [token]);
      await this.db.execute('INSERT INTO token_audit (id, event_type, token, created_at) VALUES (?, ?, ?, ?)', [crypto.randomUUID(), 'revoke', token, new Date().toISOString()]);
    }
  }

  async revokeBySession(sessionId: string) {
    try {
      const api = await import('@opentelemetry/api');
      const tracer = api.trace.getTracer('diagnosticox-auth');
      await tracer.startActiveSpan('refresh_token.revoke_by_session', { attributes: { sessionId } }, async (span: any) => {
        try {
          await this.db.execute('UPDATE refresh_tokens SET revoked = 1 WHERE session_id = ?', [sessionId]);
          await this.db.execute('INSERT INTO token_audit (id, event_type, session_id, created_at) VALUES (?, ?, ?, ?)', [crypto.randomUUID(), 'revoke_by_session', sessionId, new Date().toISOString()]);
        } catch (err) {
          span.recordException(err);
          throw err;
        } finally {
          span.end();
        }
      });
    } catch (err) {
      await this.db.execute('UPDATE refresh_tokens SET revoked = 1 WHERE session_id = ?', [sessionId]);
      await this.db.execute('INSERT INTO token_audit (id, event_type, session_id, created_at) VALUES (?, ?, ?, ?)', [crypto.randomUUID(), 'revoke_by_session', sessionId, new Date().toISOString()]);
    }
  }

  async findSessionsByUser(userId: string) {
    // Return distinct session ids for the user where token not revoked and not expired
    return this.db.query(
      `SELECT DISTINCT session_id FROM refresh_tokens WHERE user_id = ? AND (revoked = 0 OR revoked IS NULL)`,
      [userId]
    );
  }

  async rotate(oldToken: string, newSessionId: string) {
    // mark old token revoked; create a new token for newSessionId
    const existing = await this.findByToken(oldToken);
    if (!existing) throw new Error('Invalid refresh token');
    try {
      const api = await import('@opentelemetry/api');
      const tracer = api.trace.getTracer('diagnosticox-auth');
      return await tracer.startActiveSpan('refresh_token.rotate', { attributes: { oldToken, newSessionId } }, async (span: any) => {
        try {
          await this.revoke(oldToken);
          const newToken = crypto.randomBytes(32).toString('hex');
          const expiresAt = new Date(Date.now() + 60 * 60 * 24 * 30 * 1000).toISOString();
          await this.db.execute(
            'INSERT INTO refresh_tokens (token, session_id, user_id, expires_at, revoked, created_at) VALUES (?, ?, ?, ?, 0, ?)',
            [newToken, newSessionId, existing.user_id || null, expiresAt, new Date().toISOString()]
          );
          await this.db.execute('INSERT INTO token_audit (id, event_type, token, session_id, user_id, created_at) VALUES (?, ?, ?, ?, ?, ?)', [crypto.randomUUID(), 'rotate', newToken, newSessionId, existing.user_id || null, new Date().toISOString()]);
          return newToken;
        } catch (err) {
          span.recordException(err);
          throw err;
        } finally {
          span.end();
        }
      });
    } catch (err) {
      await this.revoke(oldToken);
      const newToken = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 60 * 60 * 24 * 30 * 1000).toISOString();
      await this.db.execute(
        'INSERT INTO refresh_tokens (token, session_id, user_id, expires_at, revoked, created_at) VALUES (?, ?, ?, ?, 0, ?)',
        [newToken, newSessionId, existing.user_id || null, expiresAt, new Date().toISOString()]
      );
      await this.db.execute('INSERT INTO token_audit (id, event_type, token, session_id, user_id, created_at) VALUES (?, ?, ?, ?, ?, ?)', [crypto.randomUUID(), 'rotate', newToken, newSessionId, existing.user_id || null, new Date().toISOString()]);
      return newToken;
    }
  }
}

export const refreshTokenService = new RefreshTokenService();
