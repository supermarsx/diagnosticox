import { Router } from 'express';
import { treatmentTrialController } from '../controllers/trial.controller';
import { authenticate, enforceTenant, authorize } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate, enforceTenant);

router.get('/', treatmentTrialController.list.bind(treatmentTrialController));
router.get('/patient/:patientId', treatmentTrialController.listForPatient.bind(treatmentTrialController));
router.get('/:id', treatmentTrialController.get.bind(treatmentTrialController));
router.post('/', authorize('admin', 'clinician'), treatmentTrialController.create.bind(treatmentTrialController));
router.put('/:id', authorize('admin', 'clinician'), treatmentTrialController.update.bind(treatmentTrialController));
router.post('/:trialId/metrics', authorize('admin', 'clinician'), treatmentTrialController.addMetric.bind(treatmentTrialController));

export default router;
