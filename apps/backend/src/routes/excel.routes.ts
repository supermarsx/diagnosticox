import { Router } from 'express';
import { excelController } from '../controllers/excel.controller';
import { authenticate, enforceTenant, authorize } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate, enforceTenant);

router.get('/patient/:patientId', authorize('admin', 'clinician', 'resident'), excelController.exportPatientWorkbook.bind(excelController));

export default router;
