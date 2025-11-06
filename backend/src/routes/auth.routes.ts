import { Router } from 'express';
import { authService } from '../services/auth.service';

const router = Router();

router.post('/register', async (req, res) => {
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
