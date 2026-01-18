import { Router } from 'express';
import { testController } from '../controllers/test.controller';
import { authenticate, enforceTenant, authorize } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate, enforceTenant);

router.get('/problem/:problemId', testController.listForProblem.bind(testController));
router.post('/orders', authorize('admin', 'clinician'), testController.createOrder.bind(testController));
router.post('/orders/:orderId/results', authorize('admin', 'clinician'), testController.recordResult.bind(testController));

export default router;
