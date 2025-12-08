import { Router } from 'express';
import { treatmentTrialController } from '../controllers/trial.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/patient/:patientId', treatmentTrialController.listForPatient.bind(treatmentTrialController));
router.get('/:id', treatmentTrialController.get.bind(treatmentTrialController));
router.post('/', treatmentTrialController.create.bind(treatmentTrialController));
router.put('/:id', treatmentTrialController.update.bind(treatmentTrialController));
router.post('/:trialId/metrics', treatmentTrialController.addMetric.bind(treatmentTrialController));

export default router;
