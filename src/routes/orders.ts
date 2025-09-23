import { Router } from 'express';
import { createOrder, verifyPayment, getOrderById, webhook } from '../controllers/orders.js';

const router = Router();

router.post('/create-order', createOrder);
router.post('/verify', verifyPayment);
router.get('/:id', getOrderById);
router.post('/webhook', webhook);

export default router;


