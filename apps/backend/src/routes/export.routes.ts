import { Router } from 'express';
import { exportController } from '../controllers/export.controller';
import { authenticate, enforceTenant, authorize } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate, enforceTenant);

router.get('/patient/:patientId', authorize('admin', 'clinician', 'resident'), exportController.patientBundle.bind(exportController));

export default router;
