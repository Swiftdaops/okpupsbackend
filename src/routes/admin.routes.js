import { Router } from 'express';
import { requireAdmin } from '../middlewares/auth.middleware.js';
import { auditMiddleware } from '../middlewares/audit.middleware.js';
import { upload } from '../middlewares/upload.middleware.js';

import {
  createAnimal,
  updateAnimal,
  deleteAnimal,
  adminListAnimals
} from '../controllers/animal.controller.js';
import {
  createProduct,
  updateProduct,
  deleteProduct,
  adminListProducts
} from '../controllers/product.controller.js';
import { createCategory, updateCategory, deleteCategory } from '../controllers/category.controller.js';
import { AuditLog } from '../models/AuditLog.model.js';
import { uploadAdminAvatar } from '../controllers/admin.controller.js';

const router = Router();

// Animals
router.get('/animals', requireAdmin, adminListAnimals);
router.post('/animals', requireAdmin, upload.array('images', 6), createAnimal, auditMiddleware);
router.patch('/animals/:id', requireAdmin, upload.array('images', 6), updateAnimal, auditMiddleware);
router.delete('/animals/:id', requireAdmin, deleteAnimal, auditMiddleware);

// Products
router.get('/products', requireAdmin, adminListProducts);
router.post('/products', requireAdmin, upload.array('images', 6), createProduct, auditMiddleware);
router.patch('/products/:id', requireAdmin, upload.array('images', 6), updateProduct, auditMiddleware);
router.delete('/products/:id', requireAdmin, deleteProduct, auditMiddleware);

// Categories
router.post('/categories', requireAdmin, createCategory, auditMiddleware);
router.patch('/categories/:id', requireAdmin, updateCategory, auditMiddleware);
router.delete('/categories/:id', requireAdmin, deleteCategory, auditMiddleware);

// Audit logs (admin-only)
router.get('/audit-logs', requireAdmin, async (req, res) => {
  const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(100);
  res.json({ logs });
});

// Admin profile
router.post('/profile/photo', requireAdmin, upload.single('avatar'), uploadAdminAvatar, auditMiddleware);

// Test-only endpoint to trigger an audit entry (used by tests)
router.post('/test-audit', requireAdmin, async (req, res, next) => {
  try {
    res.locals.audit = { action: 'CREATE', entityType: 'animal', entityId: req.body.entityId || null };
    await AuditLog.create({ adminId: req.admin._id, action: 'CREATE', entityType: 'animal', entityId: req.body.entityId || undefined });
    return res.status(201).json({ ok: true });
  } catch (err) {
    return next(err);
  }
});

export default router;
