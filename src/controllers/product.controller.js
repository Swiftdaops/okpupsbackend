import { Product } from '../models/Product.model.js';
import { createProductSchema, updateProductSchema } from '../validations/product.schema.js';
import { sanitizeObject } from '../utils/sanitizeInput.js';
import { uploadImagesToCloudinary } from '../controllers/upload.controller.js';
import { ZodError } from 'zod';
import { AuditLog } from '../models/AuditLog.model.js';
import { createAuditLog } from '../utils/createAuditLog.js';

export async function listProducts(req, res) {
  const filter = { isActive: true };
  if (req.query.categoryId) filter.categoryId = req.query.categoryId;
  // basic text search across name and brand
  if (req.query.q) {
    const q = String(req.query.q).trim();
    if (q) {
      const re = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), 'i');
      filter.$or = [{ name: re }, { brand: re }, { purpose: re }, { 'specs.ingredients': re }];
    }
  }
  const products = await Product.find(filter).sort({ createdAt: -1 });
  return res.json({ products });
}

export async function getProduct(req, res) {
  const product = await Product.findById(req.params.id);
  if (!product || !product.isActive) return res.status(404).json({ message: 'Product not found' });
  return res.json({ product });
}

export async function adminListProducts(req, res) {
  const filter = {};
  if (typeof req.query.isActive !== 'undefined') filter.isActive = req.query.isActive === 'true';
  if (req.query.categoryId) filter.categoryId = req.query.categoryId;
  const products = await Product.find(filter).sort({ createdAt: -1 });
  return res.json({ products });
}

export async function createProduct(req, res) {
  try {
    const body = sanitizeObject(req.body);
    const data = createProductSchema.parse(body);

    const imageUrls = await uploadImagesToCloudinary(req.files || []);
    const product = await Product.create({ ...data, images: imageUrls });

    if (req.admin?._id) {
      await AuditLog.create({ adminId: req.admin._id, action: 'CREATE', entityType: 'product', entityId: product._id });
    }

    return res.status(201).json({ product });
  } catch (err) {
    if (err instanceof ZodError) {
      return res.status(400).json({ error: 'Validation failed', issues: err.issues });
    }
    // eslint-disable-next-line no-console
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function updateProduct(req, res) {
  const body = sanitizeObject(req.body);
  const data = updateProductSchema.parse(body);
  const imageUrls = req.files?.length ? await uploadImagesToCloudinary(req.files) : null;
  const update = imageUrls ? { ...data, $push: { images: { $each: imageUrls } } } : data;

  const product = await Product.findByIdAndUpdate(req.params.id, update, { new: true });
  if (!product) return res.status(404).json({ message: 'Product not found' });
  if (req.admin && req.admin._id) {
    await createAuditLog({ adminId: req.admin._id, action: 'UPDATE', entityType: 'product', entityId: product._id });
  }
  return res.json({ product });
}

export async function deleteProduct(req, res) {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  if (req.admin && req.admin._id) {
    await createAuditLog({ adminId: req.admin._id, action: 'DELETE', entityType: 'product', entityId: product._id });
  }
  return res.json({ ok: true });
}
