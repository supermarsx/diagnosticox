import { Router } from 'express';
import { authService } from '../services/auth.service';
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
  try {
    const { email, password, full_name, organization_id, role } = req.body;

    if (!email || !password || !full_name || !organization_id) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await authService.register(email, password, full_name, organization_id, role);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Bootstrap endpoint: creates first organization and admin user on a fresh install
router.post('/bootstrap', idempotencyHandler, async (req, res) => {
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

    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Missing email or password' });
    }

    const result = await authService.login(email, password);
    res.json(result);
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
});

export default router;
