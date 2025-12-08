import { Router } from 'express';
import { authService } from '../services/auth.service';
import { sessionService } from '../services/session.service';
import { cacheService } from '../services/cache.service';
import { refreshTokenService } from '../services/refreshToken.service';
import crypto from 'crypto';
import { idempotencyHandler } from '../middleware/idempotency.middleware';

/**
 * Authentication routes
 *
 * Contains convenience endpoints used by the application during development
 * and initial bootstrap scenarios. Endpoints covered here:
 *  - POST /register  -> register a user in an organization (idempotent keys supported)
 *  - POST /bootstrap -> create the first org + admin user on a fresh deployment
 *  - POST /login     -> exchange email+password for a JWT access token
 *
 * These endpoints use the AuthService for password hashing and JWT generation.
 */
const router = Router();

router.post('/register', idempotencyHandler, async (req, res) => {
  // try to attach an OTEL span around registration if tracing is available
  try {
    const api = await import('@opentelemetry/api');
    const tracer = api.trace.getTracer('diagnosticox-auth');

    await tracer.startActiveSpan('auth.register', { attributes: { path: req.originalUrl } }, async (span: any) => {
      try {
        const { email, password, full_name, organization_id, role } = req.body;

        if (!email || !password || !full_name || !organization_id) {
          return res.status(400).json({ error: 'Missing required fields' });
        }

        const result = await authService.register(email, password, full_name, organization_id, role);

        // create a short-lived session and a refresh token
        const sessionId = await sessionService.createSession({ userId: result.user.id, organizationId: organization_id, role: role || 'clinician' }, 60 * 60 * 24 * 7); // 7 days session
        // store a persistent refresh token in the DB and return it
        const refreshToken = await refreshTokenService.create(sessionId, result.user.id, 60 * 60 * 24 * 30);

        // produce an access token with session claim
        const token = authService.generateToken(result.user.id, organization_id, role || 'clinician', sessionId);

        res.status(201).json({ user: result.user, token, sessionId, refreshToken });
      } catch (error: any) {
        span.recordException(error);
        span.setStatus({ code: api.SpanStatusCode.ERROR, message: error?.message });
        res.status(400).json({ error: error.message });
      } finally {
        span.end();
      }
    });
  } catch (err) {
    // tracing not available — continue without span
    try {
      const { email, password, full_name, organization_id, role } = req.body;

      if (!email || !password || !full_name || !organization_id) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const result = await authService.register(email, password, full_name, organization_id, role);

      // create a short-lived session and a refresh token
      const sessionId = await sessionService.createSession({ userId: result.user.id, organizationId: organization_id, role: role || 'clinician' }, 60 * 60 * 24 * 7); // 7 days session
      // store a persistent refresh token in the DB and return it
      const refreshToken = await refreshTokenService.create(sessionId, result.user.id, 60 * 60 * 24 * 30);

      // produce an access token with session claim
      const token = authService.generateToken(result.user.id, organization_id, role || 'clinician', sessionId);

      res.status(201).json({ user: result.user, token, sessionId, refreshToken });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
});

// Bootstrap endpoint: creates first organization and admin user on a fresh install
router.post('/bootstrap', idempotencyHandler, async (req, res) => {
  // wrap bootstrap flow in a span if tracing is present
  try {
    const api = await import('@opentelemetry/api');
    const tracer = api.trace.getTracer('diagnosticox-auth');

    await tracer.startActiveSpan('auth.bootstrap', { attributes: { path: req.originalUrl } }, async (span: any) => {
      try {
        const { org_name, admin_email, admin_password, admin_full_name, org_id } = req.body;

        if (!org_name || !admin_email || !admin_password || !admin_full_name) {
          return res.status(400).json({ error: 'Missing required fields' });
        }

        const result = await authService.bootstrapAdmin(
          org_name,
          admin_email,
          admin_password,
          admin_full_name,
          org_id
        );
        // create session + refresh token for bootstrap admin
        const sessionId = await sessionService.createSession({ userId: result.user.id, organizationId: result.organizationId, role: 'admin' }, 60 * 60 * 24 * 7);
        const refreshToken = await refreshTokenService.create(sessionId, result.user.id, 60 * 60 * 24 * 30);

        const token = authService.generateToken(result.user.id, result.organizationId, 'admin', sessionId);
        res.status(201).json({ organizationId: result.organizationId, user: result.user, token, sessionId, refreshToken });
      } catch (error: any) {
        span.recordException(error);
        span.setStatus({ code: api.SpanStatusCode.ERROR, message: error?.message });
        res.status(400).json({ error: error.message });
      } finally {
        span.end();
      }
    });
  } catch (err) {
    // no tracing available — run normal bootstrap flow
    try {
      const { org_name, admin_email, admin_password, admin_full_name, org_id } = req.body;

      if (!org_name || !admin_email || !admin_password || !admin_full_name) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const result = await authService.bootstrapAdmin(
        org_name,
        admin_email,
        admin_password,
        admin_full_name,
        org_id
      );
      // create session + refresh token for bootstrap admin
      const sessionId = await sessionService.createSession({ userId: result.user.id, organizationId: result.organizationId, role: 'admin' }, 60 * 60 * 24 * 7);
      const refreshToken = await refreshTokenService.create(sessionId, result.user.id, 60 * 60 * 24 * 30);

      const token = authService.generateToken(result.user.id, result.organizationId, 'admin', sessionId);
      res.status(201).json({ organizationId: result.organizationId, user: result.user, token, sessionId, refreshToken });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
});

router.post('/login', async (req, res) => {
  // add tracing span to login when available
  try {
    const api = await import('@opentelemetry/api');
    const tracer = api.trace.getTracer('diagnosticox-auth');

    await tracer.startActiveSpan('auth.login', { attributes: { path: req.originalUrl } }, async (span: any) => {
      try {
        const { email, password } = req.body;

        if (!email || !password) {
          return res.status(400).json({ error: 'Missing email or password' });
        }

        const result = await authService.login(email, password);

        // create session + refresh token
        const sessionId = await sessionService.createSession({ userId: result.user.id, organizationId: result.user.organization_id, role: result.user.role }, 60 * 60 * 24 * 7);
        const refreshToken = await refreshTokenService.create(sessionId, result.user.id, 60 * 60 * 24 * 30);

        const token = authService.generateToken(result.user.id, result.user.organization_id, result.user.role, sessionId);
        res.json({ user: result.user, token, sessionId, refreshToken });
      } catch (error: any) {
        span.recordException(error);
        span.setStatus({ code: api.SpanStatusCode.ERROR, message: error?.message });
        res.status(401).json({ error: error.message });
      } finally {
        span.end();
      }
    });
  } catch (err) {
    // no tracing - behave normally
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Missing email or password' });
      }

      const result = await authService.login(email, password);

      // create session + refresh token
      const sessionId = await sessionService.createSession({ userId: result.user.id, organizationId: result.user.organization_id, role: result.user.role }, 60 * 60 * 24 * 7);
      const refreshToken = await refreshTokenService.create(sessionId, result.user.id, 60 * 60 * 24 * 30);

      const token = authService.generateToken(result.user.id, result.user.organization_id, result.user.role, sessionId);
      res.json({ user: result.user, token, sessionId, refreshToken });
    } catch (error: any) {
      res.status(401).json({ error: error.message });
    }
  }
});

/**
 * Token introspection (prototype)
 *
 * Accepts a token (in body { token }) or Authorization header and returns
 * the decoded claims. If the token contains a `sessionId` claim this endpoint
 * will also check whether the session still exists in the session store.
 */
router.post('/introspect', async (req, res) => {
  try {
    const token = req.body?.token || (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
    if (!token) return res.status(400).json({ error: 'Missing token' });

    const decoded = authService.verifyToken(token);
    let sessionExists = false;
    if ((decoded as any).sessionId) {
      const s = await sessionService.getSession((decoded as any).sessionId);
      sessionExists = !!s;
    }

    return res.json({ claims: decoded, sessionExists });
  } catch (err: any) {
    return res.status(401).json({ error: 'Invalid token' });
  }
});

/**
 * Refresh access token
 * Request: { refreshToken }
 * - Verifies the refresh token mapping, rotates to a new session + refresh token,
 *   and returns a new access token + refresh token.
 */
router.post('/token/refresh', async (req, res) => {
  // make refresh flow traceable when tracer available
  try {
    const api = await import('@opentelemetry/api');
    const tracer = api.trace.getTracer('diagnosticox-auth');

    await tracer.startActiveSpan('auth.token.refresh', { attributes: { path: req.originalUrl } }, async (span: any) => {
      try {
        const incoming = req.body?.refreshToken || req.body?.refresh_token;
        if (!incoming) return res.status(400).json({ error: 'Missing refreshToken' });

        const row = await refreshTokenService.findByToken(incoming);
        if (!row || row.revoked) return res.status(401).json({ error: 'Invalid refresh token' });

        const sessionId = row.session_id as string;
        const session = await sessionService.getSession(sessionId);
        if (!session) return res.status(401).json({ error: 'Invalid session' });

        // rotate: create a new session and refresh token, delete old keys
        const newSessionId = await sessionService.createSession(session, 60 * 60 * 24 * 7);
        // rotate in the DB (revoke old, insert new)
        const newRefresh = await refreshTokenService.rotate(incoming, newSessionId);
        await sessionService.destroySession(sessionId);

        // issue new access token containing new sessionId
        const token = authService.generateToken(session.userId || 'unknown', session.organizationId || 'unknown', session.role || 'clinician', newSessionId);

        return res.json({ token, sessionId: newSessionId, refreshToken: newRefresh });
      } catch (err: any) {
        span.recordException(err);
        span.setStatus({ code: api.SpanStatusCode.ERROR, message: err?.message });
        return res.status(500).json({ error: err.message || 'Refresh failed' });
      } finally {
        span.end();
      }
    });
  } catch (err) {
    // fallback: no tracing available — run original flow
    try {
      const incoming = req.body?.refreshToken || req.body?.refresh_token;
      if (!incoming) return res.status(400).json({ error: 'Missing refreshToken' });

      const row = await refreshTokenService.findByToken(incoming);
      if (!row || row.revoked) return res.status(401).json({ error: 'Invalid refresh token' });

      const sessionId = row.session_id as string;
      const session = await sessionService.getSession(sessionId);
      if (!session) return res.status(401).json({ error: 'Invalid session' });

      // rotate: create a new session and refresh token, delete old keys
      const newSessionId = await sessionService.createSession(session, 60 * 60 * 24 * 7);
      // rotate in the DB (revoke old, insert new)
      const newRefresh = await refreshTokenService.rotate(incoming, newSessionId);
      await sessionService.destroySession(sessionId);

      // issue new access token containing new sessionId
      const token = authService.generateToken(session.userId || 'unknown', session.organizationId || 'unknown', session.role || 'clinician', newSessionId);

      return res.json({ token, sessionId: newSessionId, refreshToken: newRefresh });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Refresh failed' });
    }
  }
});

/**
 * Revoke a refresh token or session. Accepts { refreshToken } or { sessionId }.
 * This will remove the refresh<>session mapping and the underlying session.
 */
router.post('/token/revoke', async (req, res) => {
  // add a tracer span when available for revoke flow
  try {
    const api = await import('@opentelemetry/api');
    const tracer = api.trace.getTracer('diagnosticox-auth');

    await tracer.startActiveSpan('auth.token.revoke', { attributes: { path: req.originalUrl } }, async (span: any) => {
      try {
        const refresh = req.body?.refreshToken || req.body?.refresh_token;
        const sessionId = req.body?.sessionId || req.body?.session_id;

        let targetSession: string | null = sessionId || null;

        if (!targetSession && refresh) {
          const found = await refreshTokenService.findByToken(refresh as string);
          if (found) targetSession = found.session_id as string;
        }

        if (!targetSession) return res.status(400).json({ error: 'Missing token/sessionId' });

        // remove potential refresh mapping and session
        const refreshRow = await refreshTokenService.findByToken((refresh as string) || '');
        if (refreshRow) {
          // revoke the single provided refresh token
          await refreshTokenService.revoke(refresh as string);
        }

        // always revoke any refresh tokens tied to the session id
        if (targetSession) await refreshTokenService.revokeBySession(targetSession);
        await sessionService.destroySession(targetSession);

        return res.json({ ok: true });
      } catch (err: any) {
        span.recordException(err);
        span.setStatus({ code: api.SpanStatusCode.ERROR, message: err?.message });
        return res.status(500).json({ error: err.message || 'Revoke failed' });
      } finally {
        span.end();
      }
    });
  } catch (err) {
    // fallback if tracing not installed
    try {
      const refresh = req.body?.refreshToken || req.body?.refresh_token;
      const sessionId = req.body?.sessionId || req.body?.session_id;

      let targetSession: string | null = sessionId || null;

      if (!targetSession && refresh) {
        const found = await refreshTokenService.findByToken(refresh as string);
        if (found) targetSession = found.session_id as string;
      }

      if (!targetSession) return res.status(400).json({ error: 'Missing token/sessionId' });

      // remove potential refresh mapping and session
      const refreshRow = await refreshTokenService.findByToken((refresh as string) || '');
      if (refreshRow) {
        // revoke the single provided refresh token
        await refreshTokenService.revoke(refresh as string);
      }

      // always revoke any refresh tokens tied to the session id
      if (targetSession) await refreshTokenService.revokeBySession(targetSession);
      await sessionService.destroySession(targetSession);

      return res.json({ ok: true });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Revoke failed' });
    }
  }
});

/**
 * List sessions for a user (admin or the same user). Query param: userId
 * Returns an array of session objects + refresh token summary where available.
 */
router.get('/sessions', async (req, res) => {
  // add tracing around listing sessions when tracer available
  try {
    const api = await import('@opentelemetry/api');
    const tracer = api.trace.getTracer('diagnosticox-auth');

    await tracer.startActiveSpan('auth.sessions.list', { attributes: { path: req.originalUrl } }, async (span: any) => {
      try {
        const userId = req.query.userId as string | undefined;
        if (!userId) return res.status(400).json({ error: 'Missing userId query parameter' });

        const authHeader = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
        if (!authHeader) return res.status(401).json({ error: 'Missing Authorization token' });

        let claims: any;
        try {
          claims = authService.verifyToken(authHeader) as any;
        } catch (err) {
          return res.status(401).json({ error: 'Invalid token' });
        }

        // allow if caller is admin or caller user matches requested userId
        if (claims.role !== 'admin' && claims.userId !== userId) {
          return res.status(403).json({ error: 'Insufficient permissions' });
        }

        const rows = await refreshTokenService.findSessionsByUser(userId);
        const sessions = [] as any[];
        for (const r of rows) {
          const sessionId = (r as any).session_id;
          const session = await sessionService.getSession(sessionId);
          sessions.push({ sessionId, session });
        }

        return res.json({ sessions });
      } catch (err: any) {
        span.recordException(err);
        span.setStatus({ code: api.SpanStatusCode.ERROR, message: err?.message });
        return res.status(500).json({ error: err.message || 'Failed to list sessions' });
      } finally {
        span.end();
      }
    });
  } catch (err) {
    // no tracing — fallback to original behavior
    try {
      const userId = req.query.userId as string | undefined;
      if (!userId) return res.status(400).json({ error: 'Missing userId query parameter' });

      const authHeader = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
      if (!authHeader) return res.status(401).json({ error: 'Missing Authorization token' });

      let claims: any;
      try {
        claims = authService.verifyToken(authHeader) as any;
      } catch (err) {
        return res.status(401).json({ error: 'Invalid token' });
      }

      // allow if caller is admin or caller user matches requested userId
      if (claims.role !== 'admin' && claims.userId !== userId) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }

      const rows = await refreshTokenService.findSessionsByUser(userId);
      const sessions = [] as any[];
      for (const r of rows) {
        const sessionId = (r as any).session_id;
        const session = await sessionService.getSession(sessionId);
        sessions.push({ sessionId, session });
      }

      return res.json({ sessions });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to list sessions' });
    }
  }
});

export default router;
