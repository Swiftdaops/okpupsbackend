import { Router } from 'express';
import {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory
} from '../controllers/category.controller.js';
import { requireAdmin } from '../middlewares/auth.middleware.js';
import { auditMiddleware } from '../middlewares/audit.middleware.js';

const router = Router();

// Public
router.get('/', listCategories);

// Admin
router.post('/admin', requireAdmin, createCategory, auditMiddleware);
router.patch('/admin/:id', requireAdmin, updateCategory, auditMiddleware);
router.delete('/admin/:id', requireAdmin, deleteCategory, auditMiddleware);

export default router;
