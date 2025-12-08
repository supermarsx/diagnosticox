import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { cacheService } from '../services/cache.service';
import { idempotencyHandler } from '../middleware/idempotency.middleware';
import { authService } from '../services/auth.service';
import { sessionService } from '../services/session.service';

const router = Router();

/**
 * Internal OIDC/PKCE endpoints
 *
 * These lightweight routes provide a self-contained PKCE-style flow used by
 * the prototype app for developer/testing scenarios. They are NOT replacements
 * for a secure production OpenID Connect provider. The endpoints:
 *
 *  - POST /pkce/start  -> accept client_id, redirect_uri, code_challenge and
 *                         store the PKCE details in the cache for a short TTL
 *  - POST /pkce/complete -> exchange code + code_verifier for an app JWT
 */
// Start PKCE flow (internal lightweight flow) - returns a temporary code
router.post('/pkce/start', idempotencyHandler, async (req, res) => {
  try {
    const { client_id, redirect_uri, code_challenge, state } = req.body;
    if (!client_id || !redirect_uri || !code_challenge) {
      return res.status(400).json({ error: 'Missing required PKCE fields' });
    }

    const code = uuidv4();
    const payload = { client_id, redirect_uri, code_challenge, state };
    await cacheService.set(`pkce:${code}`, JSON.stringify(payload), 300);

    // In a real OIDC flow we'd redirect user to IdP, but for internal flow we return code
    return res.status(201).json({ code, redirect_uri, state });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'PKCE start failed' });
  }
});

// Complete PKCE flow - exchange code and code_verifier for a JWT token
router.post('/pkce/complete', async (req, res) => {
  try {
    const { code, code_verifier, username } = req.body;
    if (!code || !code_verifier) {
      return res.status(400).json({ error: 'Missing code or code_verifier' });
    }

    const raw = await cacheService.get(`pkce:${code}`);
    if (!raw) return res.status(400).json({ error: 'Invalid or expired code' });

    const payload = JSON.parse(raw) as { client_id: string; redirect_uri: string; code_challenge: string; state?: string };

    // For internal lightweight check, compare code_verifier SHA256 base64url to code_challenge
    const crypto = await import('crypto');
    const hashed = crypto.createHash('sha256').update(code_verifier).digest();
    const b64 = hashed.toString('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

    if (b64 !== payload.code_challenge) {
      return res.status(400).json({ error: 'PKCE verification failed' });
    }

    // For demo: if username provided, locate user and return token, otherwise return simple token for demo user
    const userId = username ? username : 'system-pkce-user';
    // Create a short lived session for the user and return the session id
    const sessionId = await sessionService.createSession({ userId, organizationId: payload.client_id, role: 'clinician' }, 60 * 60);

    const token = authService.generateToken(userId, payload.client_id, 'clinician', sessionId);

    // remove pkce code
    await cacheService.del(`pkce:${code}`);

    return res.json({ token, sessionId });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'PKCE complete failed' });
  }
});

export default router;
