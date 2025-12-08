import { Router } from 'express';
import { problemController } from '../controllers/problem.controller';
import { authenticate, enforceTenant, authorize } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate, enforceTenant);

router.get('/patient/:patientId', problemController.listForPatient.bind(problemController));
router.get('/:id', problemController.get.bind(problemController));
router.post('/', authorize('admin', 'clinician'), problemController.create.bind(problemController));
router.put('/:id', authorize('admin', 'clinician'), problemController.update.bind(problemController));

export default router;
