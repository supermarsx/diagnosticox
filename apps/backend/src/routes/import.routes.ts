import { Router } from 'express';
import { importController } from '../controllers/import.controller';
import { authenticate, enforceTenant, authorize } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate, enforceTenant);

// Accepts text/csv body
router.post('/facts', authorize('admin', 'clinician'), importController.importFacts.bind(importController));

export default router;
