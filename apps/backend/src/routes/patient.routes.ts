import { Router } from 'express';
import { patientController } from '../controllers/patient.controller';
import { authenticate, enforceTenant, authorize } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate, enforceTenant);

router.get('/', patientController.list.bind(patientController));
router.get('/summary', patientController.summary.bind(patientController));
router.get('/:id', patientController.get.bind(patientController));
router.post('/', authorize('admin', 'clinician'), patientController.create.bind(patientController));
router.put('/:id', authorize('admin', 'clinician'), patientController.update.bind(patientController));
router.delete('/:id', authorize('admin'), patientController.delete.bind(patientController));

export default router;
