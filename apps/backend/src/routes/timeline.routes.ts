import { Router } from 'express';
import { timelineController } from '../controllers/timeline.controller';
import { authenticate, enforceTenant, authorize } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate, enforceTenant);

router.get('/', timelineController.list.bind(timelineController));
router.get('/patient/:patientId', timelineController.listForPatient.bind(timelineController));
router.post('/', authorize('admin', 'clinician'), timelineController.create.bind(timelineController));

export default router;
