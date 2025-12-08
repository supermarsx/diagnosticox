import { Router } from 'express';
import { icdController } from '../controllers/icd.controller';
import { authenticate, enforceTenant, authorize } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate, enforceTenant);

router.get('/search', authorize('admin', 'clinician', 'resident'), icdController.search.bind(icdController));
router.get('/:version/:code', authorize('admin', 'clinician', 'resident'), icdController.detail.bind(icdController));

export default router;
