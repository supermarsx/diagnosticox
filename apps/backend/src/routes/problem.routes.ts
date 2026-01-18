import { Router } from 'express';
import { problemController } from '../controllers/problem.controller';
import { authenticate, enforceTenant, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { problemSchema } from '../utils/schemas';

const router = Router();

router.use(authenticate, enforceTenant);

router.get('/patient/:patientId', problemController.listForPatient.bind(problemController));
router.get('/:id', problemController.get.bind(problemController));
router.get('/:id/validate-closure', problemController.validateClosure.bind(problemController));
router.post('/', authorize('admin', 'clinician'), validate(problemSchema), problemController.create.bind(problemController));
router.put('/:id', authorize('admin', 'clinician'), problemController.update.bind(problemController));

export default router;
