import { Router } from 'express';
import { sessionService } from '../services/session.service';

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
    await sessionService.destroySession(id);
    return res.json({ ok: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to delete session' });
  }
});

export default router;
