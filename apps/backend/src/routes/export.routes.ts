import { Router } from 'express';
import { exportController } from '../controllers/export.controller';
import { authenticate, enforceTenant, authorize } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate, enforceTenant);

router.get('/patient/:patientId', exportController.patientBundle.bind(exportController));
router.post('/patient/:patientId/deidentified', exportController.deidentifiedExport.bind(exportController));

export default router;
