import { Router } from 'express';
import { factController } from '../controllers/fact.controller';
import { authenticate, enforceTenant, authorize } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate, enforceTenant);

router.get('/patient/:patientId', factController.listForPatient.bind(factController));
router.post('/', authorize('admin', 'clinician'), factController.create.bind(factController));
router.put('/:id', authorize('admin', 'clinician'), factController.update.bind(factController));
router.delete('/:id', authorize('admin'), factController.delete.bind(factController));

export default router;
