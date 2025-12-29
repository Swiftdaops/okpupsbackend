import { Router } from 'express';
import {
  listProducts,
  getProduct,
  adminListProducts,
  createProduct,
  updateProduct,
  deleteProduct
} from '../controllers/product.controller.js';
import { requireAdmin } from '../middlewares/auth.middleware.js';
import { auditMiddleware } from '../middlewares/audit.middleware.js';
import { upload } from '../middlewares/upload.middleware.js';
import { adminTopProducts, likeProduct } from '../controllers/stats.controller.js';

const router = Router();

// Public
router.get('/', listProducts);
router.post('/:id/like', likeProduct);

// Admin
router.get('/admin/list', requireAdmin, adminListProducts);
router.get('/admin/stats/top', requireAdmin, adminTopProducts);
router.post('/admin', requireAdmin, upload.array('images', 6), createProduct, auditMiddleware);
router.patch('/admin/:id', requireAdmin, upload.array('images', 6), updateProduct, auditMiddleware);
router.delete('/admin/:id', requireAdmin, deleteProduct, auditMiddleware);

// Public (keep last so it doesn't shadow /admin/*)
router.get('/:id', getProduct);

export default router;
