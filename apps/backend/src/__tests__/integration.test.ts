/**
 * Integration tests for the backend using the running app instance.
 * These tests exercise the PKCE endpoints and idempotency behavior. They are
 * designed to run against the in-process Express app and do not require a
 * database or external services (Redis fallback is used when Redis isn't
 * reachable).
 */
import { describe, test, expect } from 'vitest';
import request from 'supertest';
import app from '../index';

describe('Integration — PKCE + Idempotency', () => {
  test('PKCE start -> complete returns token', async () => {
    const codeVerifier = 'test-verifier-1234';
    // compute base64url-encoded SHA256 of codeVerifier to simulate client-side PKCE
    const crypto = await import('crypto');
    const hashed = crypto.createHash('sha256').update(codeVerifier).digest();
    const codeChallenge = hashed.toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

    const start = await request(app)
      .post('/api/auth/oidc/pkce/start')
      .send({ client_id: 'test-client', redirect_uri: 'https://app.example/cb', code_challenge: codeChallenge })
      .expect(201);

    expect(start.body).toHaveProperty('code');
    const { code } = start.body;

    const complete = await request(app)
      .post('/api/auth/oidc/pkce/complete')
      .send({ code, code_verifier: codeVerifier })
      .expect(200);

    expect(complete.body).toHaveProperty('token');
    // token only ensures authService produced a JWT for the demo user
  });

  test('PKCE complete also creates a session entry in the cache', async () => {
    const codeVerifier = 'session-verifier-1234';
    const crypto = await import('crypto');
    const hashed = crypto.createHash('sha256').update(codeVerifier).digest();
    const codeChallenge = hashed.toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

    const start = await request(app)
      .post('/api/auth/oidc/pkce/start')
      .send({ client_id: 'session-client', redirect_uri: 'https://cb', code_challenge: codeChallenge })
      .expect(201);

    const { code } = start.body;

    const complete = await request(app)
      .post('/api/auth/oidc/pkce/complete')
      .send({ code, code_verifier: codeVerifier })
      .expect(200);

    expect(complete.body).toHaveProperty('token');
    expect(complete.body).toHaveProperty('sessionId');

    // Confirm the session exists in the cache
    const { sessionService } = await import('../services/session.service');
    const session = await sessionService.getSession(complete.body.sessionId);
    expect(session).not.toBeNull();
  });

  test('session routes allow retrieval and deletion', async () => {
    const codeVerifier = 'session-routes-verifier';
    const crypto = await import('crypto');
    const hashed = crypto.createHash('sha256').update(codeVerifier).digest();
    const codeChallenge = hashed.toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

    const start = await request(app)
      .post('/api/auth/oidc/pkce/start')
      .send({ client_id: 'session-client-2', redirect_uri: 'https://cb', code_challenge: codeChallenge })
      .expect(201);

    const { code } = start.body;

    const complete = await request(app)
      .post('/api/auth/oidc/pkce/complete')
      .send({ code, code_verifier: codeVerifier })
      .expect(200);

    const { sessionId } = complete.body;
    expect(sessionId).toBeDefined();

    // GET session
    const getRes = await request(app).get(`/api/auth/session/${sessionId}`).expect(200);
    expect(getRes.body).toHaveProperty('session');

    // DELETE session (must be authorized - token belongs to session)
    await request(app)
      .delete(`/api/auth/session/${sessionId}`)
      .set('Authorization', `Bearer ${complete.body.token}`)
      .expect(200);

    // GET should now be 404
    await request(app).get(`/api/auth/session/${sessionId}`).expect(404);
  });

  test('token introspection returns claims + session existence', async () => {
    const codeVerifier = 'introspect-verifier';
    const crypto = await import('crypto');
    const hashed = crypto.createHash('sha256').update(codeVerifier).digest();
    const codeChallenge = hashed.toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

    const start = await request(app)
      .post('/api/auth/oidc/pkce/start')
      .send({ client_id: 'introspect-client', redirect_uri: 'https://cb', code_challenge: codeChallenge })
      .expect(201);

    const { code } = start.body;

    const complete = await request(app)
      .post('/api/auth/oidc/pkce/complete')
      .send({ code, code_verifier: codeVerifier })
      .expect(200);

    const token = complete.body.token;
    const sessionId = complete.body.sessionId;

    // introspect with token in body
    const introspect = await request(app).post('/api/auth/introspect').send({ token }).expect(200);
    expect(introspect.body).toHaveProperty('claims');
    expect(introspect.body).toHaveProperty('sessionExists', true);

    // delete session then introspect should indicate session missing
    await request(app).delete(`/api/auth/session/${sessionId}`).set('Authorization', `Bearer ${token}`).expect(200);
    const introspectAfter = await request(app).post('/api/auth/introspect').send({ token }).expect(200);
    expect(introspectAfter.body.sessionExists).toBe(false);
  });

  test('PKCE start is idempotent when Idempotency-Key is provided', async () => {
    const codeVerifier = 'idem-verifier-1234';
    const crypto = await import('crypto');
    const hashed = crypto.createHash('sha256').update(codeVerifier).digest();
    const codeChallenge = hashed.toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

    const idemKey = 'test-idem-key-1';

    const first = await request(app)
      .post('/api/auth/oidc/pkce/start')
      .set('Idempotency-Key', idemKey)
      .send({ client_id: 'c1', redirect_uri: 'https://cb', code_challenge: codeChallenge })
      .expect(201);

    const second = await request(app)
      .post('/api/auth/oidc/pkce/start')
      .set('Idempotency-Key', idemKey)
      .send({ client_id: 'c1', redirect_uri: 'https://cb', code_challenge: codeChallenge })
      .expect(201);

    // ensure that the two responses are identical (status+body) — idempotency returns cached response
    expect(second.body).toEqual(first.body);
  });

  test('refresh token exchange rotates session and can be revoked', async () => {
    const codeVerifier = 'refresh-verifier';
    const crypto = await import('crypto');
    const hashed = crypto.createHash('sha256').update(codeVerifier).digest();
    const codeChallenge = hashed.toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

    const start = await request(app)
      .post('/api/auth/oidc/pkce/start')
      .send({ client_id: 'refresh-client', redirect_uri: 'https://cb', code_challenge: codeChallenge })
      .expect(201);

    const { code } = start.body;
    const complete = await request(app).post('/api/auth/oidc/pkce/complete').send({ code, code_verifier: codeVerifier }).expect(200);
    const oldRefresh = complete.body.refreshToken;
    const oldSession = complete.body.sessionId;
    expect(oldRefresh).toBeDefined();

    // Exchange refresh -> rotated session + token
    const exchange = await request(app).post('/api/auth/token/refresh').send({ refreshToken: oldRefresh }).expect(200);
    expect(exchange.body).toHaveProperty('token');
    expect(exchange.body).toHaveProperty('sessionId');
    expect(exchange.body).toHaveProperty('refreshToken');

    const newSession = exchange.body.sessionId;
    const newRefresh = exchange.body.refreshToken;
    expect(newSession).not.toEqual(oldSession);
    expect(newRefresh).not.toEqual(oldRefresh);

    // Validate introspection shows session exists for new token
    const introspect = await request(app).post('/api/auth/introspect').send({ token: exchange.body.token }).expect(200);
    expect(introspect.body.sessionExists).toBe(true);

    // Revoke new refresh token
    await request(app).post('/api/auth/token/revoke').send({ refreshToken: newRefresh }).expect(200);

    // introspection shows session missing
    const introspectAfter = await request(app).post('/api/auth/introspect').send({ token: exchange.body.token }).expect(200);
    expect(introspectAfter.body.sessionExists).toBe(false);
  });
});
