
import { Router } from 'express';
import { trialController } from '../controllers/trial.controller';

const router = Router();

router.post('/api/trial/start', trialController.startTrial);

export { router as trialRouter };
