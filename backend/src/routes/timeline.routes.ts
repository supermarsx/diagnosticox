import { Router } from 'express';
import { timelineController } from '../controllers/timeline.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/patient/:patientId', timelineController.listForPatient.bind(timelineController));
router.post('/', timelineController.create.bind(timelineController));

export default router;
