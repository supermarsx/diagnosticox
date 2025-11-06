import { Router } from 'express';
import { patientController } from '../controllers/patient.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', patientController.list.bind(patientController));
router.get('/:id', patientController.get.bind(patientController));
router.post('/', patientController.create.bind(patientController));
router.put('/:id', patientController.update.bind(patientController));
router.delete('/:id', patientController.delete.bind(patientController));

export default router;
