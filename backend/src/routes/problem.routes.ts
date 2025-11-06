import { Router } from 'express';
import { problemController } from '../controllers/problem.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/patient/:patientId', problemController.listForPatient.bind(problemController));
router.get('/:id', problemController.get.bind(problemController));
router.post('/', problemController.create.bind(problemController));
router.put('/:id', problemController.update.bind(problemController));

export default router;
