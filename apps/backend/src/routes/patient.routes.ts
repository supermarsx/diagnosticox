import { Router } from 'express';
import { patientController } from '../controllers/patient.controller';
import { authenticate, enforceTenant, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { patientSchema } from '../utils/schemas';

const router = Router();

router.use(authenticate, enforceTenant);

router.get('/', (req, res) => patientController.list(req as any, res));
router.get('/summary', (req, res) => patientController.summary(req as any, res));
router.get('/:id', (req, res) => patientController.get(req as any, res));
router.post('/', authorize('admin', 'clinician'), validate(patientSchema), (req, res) => patientController.create(req as any, res));
router.put('/:id', authorize('admin', 'clinician'), (req, res) => patientController.update(req as any, res));
router.delete('/:id', authorize('admin'), (req, res) => patientController.delete(req as any, res));

export default router;
