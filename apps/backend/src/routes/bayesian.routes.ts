import { Router } from 'express';
import { bayesianController } from '../controllers/bayesian.controller';
import { authenticate, enforceTenant } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate, enforceTenant);

router.post('/calculate', bayesianController.calculate.bind(bayesianController));
router.post('/calculate-both', bayesianController.calculateBoth.bind(bayesianController));
router.post('/from-sens-spec', bayesianController.calculateFromSensSpec.bind(bayesianController));
router.post('/recommend-tier', bayesianController.recommendTier.bind(bayesianController));

export default router;
