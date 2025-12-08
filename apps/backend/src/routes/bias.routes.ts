import { Router } from 'express';
import { biasController } from '../controllers/bias.controller';
import { authenticate, enforceTenant, authorize } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate, enforceTenant);

router.get('/patient/:patientId', biasController.listForPatient.bind(biasController));
router.post('/', authorize('admin', 'clinician'), biasController.create.bind(biasController));

export default router;
