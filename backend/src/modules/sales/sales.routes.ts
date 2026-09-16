import { Router } from 'express';
import { getOrders, createOrder } from './sales.controller';

const router = Router();

router.get('/orders', getOrders);
router.post('/orders', createOrder);

export default router;
