import { Router } from 'express';
import { fhirController } from '../controllers/fhir.controller';
import { authenticate, enforceTenant, authorize } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate, enforceTenant);

router.get('/patients/:patientId/observations', authorize('admin', 'clinician', 'resident'), fhirController.getObservations.bind(fhirController));
router.get('/patients/:patientId/conditions', authorize('admin', 'clinician', 'resident'), fhirController.getConditions.bind(fhirController));
router.get('/patients/:patientId/diagnostic-reports', authorize('admin', 'clinician', 'resident'), fhirController.getDiagnosticReports.bind(fhirController));
router.get('/patients/:patientId/medication-statements', authorize('admin', 'clinician', 'resident'), fhirController.getMedicationStatements.bind(fhirController));
router.post('/observations', authorize('admin', 'clinician'), fhirController.createObservation.bind(fhirController));
router.post('/conditions', authorize('admin', 'clinician'), fhirController.createCondition.bind(fhirController));

export default router;
