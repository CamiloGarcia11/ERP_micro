import { Router } from 'express';
import { getProducts, createProduct } from './inventory.controller';

const router = Router();

router.get('/products', getProducts);
router.post('/products', createProduct);

export default router;
