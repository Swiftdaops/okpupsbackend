import { Category } from '../models/Category.model.js';
import { createCategorySchema, updateCategorySchema } from '../validations/category.schema.js';
import { sanitizeObject } from '../utils/sanitizeInput.js';
import { createAuditLog } from '../utils/createAuditLog.js';

export async function listCategories(req, res) {
  const categories = await Category.find().sort({ createdAt: -1 });
  return res.json({ categories });
}

export async function createCategory(req, res) {
  const body = sanitizeObject(req.body);
  const data = createCategorySchema.parse(body);
  const category = await Category.create(data);
  if (req.admin && req.admin._id) {
    await createAuditLog({ adminId: req.admin._id, action: 'CREATE', entityType: 'category', entityId: category._id });
  }
  return res.status(201).json({ category });
}

export async function updateCategory(req, res) {
  const body = sanitizeObject(req.body);
  const data = updateCategorySchema.parse(body);
  const category = await Category.findByIdAndUpdate(req.params.id, data, { new: true });
  if (!category) return res.status(404).json({ message: 'Category not found' });
  if (req.admin && req.admin._id) {
    await createAuditLog({ adminId: req.admin._id, action: 'UPDATE', entityType: 'category', entityId: category._id });
  }
  return res.json({ category });
}

export async function deleteCategory(req, res) {
  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) return res.status(404).json({ message: 'Category not found' });
  if (req.admin && req.admin._id) {
    await createAuditLog({ adminId: req.admin._id, action: 'DELETE', entityType: 'category', entityId: category._id });
  }
  return res.json({ ok: true });
}
