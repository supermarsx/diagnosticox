import { Router } from 'express';
import { diaryController } from '../controllers/diary.controller';
import { authenticate, enforceTenant, authorize } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate, enforceTenant);

router.get('/', diaryController.list.bind(diaryController));
router.get('/patient/:patientId', diaryController.listForPatient.bind(diaryController));
router.get('/patient/:patientId/stats', diaryController.getStats.bind(diaryController));
router.post('/', authorize('admin', 'clinician'), diaryController.create.bind(diaryController));

export default router;
