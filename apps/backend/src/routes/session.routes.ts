import { Router } from 'express';
import { sessionService } from '../services/session.service';
import { authService } from '../services/auth.service';

// For admin checks and token ownership validation we require callers to present
// a Bearer token matching the session or be an admin. This prevents open deletion
// without authorization in non-dev environments.

const router = Router();

/**
 * Session management routes (for prototype/demo usage)
 *
 * - GET /:id -> retrieve a session object
 * - DELETE /:id -> destroy a session
 *
 * In production these routes would require strong authentication/authorization
 * and tighter controls. They exist here to support testing and small admin
 * operations during development.
 */

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const session = await sessionService.getSession(id);
    if (!session) return res.status(404).json({ error: 'Session not found' });
    return res.json({ session });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to get session' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // authorize: require a bearer token, check session match or admin role
    const authHeader = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
    if (!authHeader) return res.status(401).json({ error: 'Missing Authorization token' });

    try {
      const claims = authService.verifyToken(authHeader) as any;
      if (claims.role !== 'admin' && claims.sessionId !== id) {
        return res.status(403).json({ error: 'Insufficient permissions to destroy session' });
      }
    } catch (err) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    await sessionService.destroySession(id);
    return res.json({ ok: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to delete session' });
  }
});

export default router;
