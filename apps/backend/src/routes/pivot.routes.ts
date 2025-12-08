import { Router } from 'express';
import { pivotController } from '../controllers/pivot.controller';
import { authenticate, enforceTenant, authorize } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate, enforceTenant);

router.get('/', pivotController.list.bind(pivotController));
router.post('/', authorize('admin', 'clinician'), pivotController.create.bind(pivotController));

export default router;
