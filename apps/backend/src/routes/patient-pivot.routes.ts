import { Router } from 'express';
import { patientPivotController } from '../controllers/patient-pivot.controller';
import { authenticate, enforceTenant, authorize } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate, enforceTenant);

router.get('/patient/:patientId', patientPivotController.listForPatient.bind(patientPivotController));
router.post('/', authorize('admin', 'clinician'), patientPivotController.create.bind(patientPivotController));

export default router;
