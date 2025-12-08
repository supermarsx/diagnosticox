import { Router } from 'express';
import { aiController } from '../controllers/ai.controller';
import { authenticate, enforceTenant, authorize } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate, enforceTenant);

router.get('/providers', authorize('admin', 'clinician', 'resident'), aiController.listProviders.bind(aiController));
router.post('/analyze', authorize('admin', 'clinician', 'resident'), aiController.analyze.bind(aiController));

export default router;
