import { Router } from 'express';
import { getEvents, simulateFlow, resetEvents } from './events.controller';

const router = Router();

router.get('/', getEvents);
router.post('/simulate', simulateFlow);
router.post('/reset', resetEvents);

export default router;
