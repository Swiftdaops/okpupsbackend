import { Router } from 'express';
import {
  listAnimals,
  getAnimal,
  adminListAnimals,
  createAnimal,
  updateAnimal,
  deleteAnimal
} from '../controllers/animal.controller.js';
import { likeAnimal, adminTopAnimals, getAnimalStats } from '../controllers/stats.controller.js';
import { requireAdmin } from '../middlewares/auth.middleware.js';
import { auditMiddleware } from '../middlewares/audit.middleware.js';
import { upload } from '../middlewares/upload.middleware.js';

const router = Router();

// Public
router.get('/', listAnimals);
router.post('/:id/like', likeAnimal);

// stats
router.get('/:id/stats', getAnimalStats);

// Admin
router.get('/admin/list', requireAdmin, adminListAnimals);
router.get('/admin/stats/top', requireAdmin, adminTopAnimals);
router.post('/admin', requireAdmin, upload.array('images', 6), createAnimal, auditMiddleware);
router.patch('/admin/:id', requireAdmin, upload.array('images', 6), updateAnimal, auditMiddleware);
router.delete('/admin/:id', requireAdmin, deleteAnimal, auditMiddleware);

// Public (keep last so it doesn't shadow /admin/*)
router.get('/:id', getAnimal);

export default router;
