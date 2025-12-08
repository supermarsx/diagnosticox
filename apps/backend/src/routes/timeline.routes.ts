import { Router } from 'express';
import { timelineController } from '../controllers/timeline.controller';
import { authenticate, enforceTenant } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate, enforceTenant);

router.get('/patient/:patientId', timelineController.listForPatient.bind(timelineController));
router.post('/', timelineController.create.bind(timelineController));

export default router;
