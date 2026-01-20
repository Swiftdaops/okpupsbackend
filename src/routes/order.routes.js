import { Router } from 'express';
import { createOrder } from '../controllers/order.controller.js';

const router = Router();

// Public endpoint: customer places an order, then pays via WhatsApp
router.post('/', createOrder);

export default router;
