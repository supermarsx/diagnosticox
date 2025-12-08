import { Router } from 'express';
import { reportController } from '../controllers/report.controller';
import { authenticate, enforceTenant, authorize } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate, enforceTenant);

router.get('/outcomes', authorize('admin', 'clinician', 'resident'), reportController.outcomes.bind(reportController));

export default router;
