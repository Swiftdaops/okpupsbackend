import { AnimalBaby } from '../models/AnimalBaby.model.js';
import { createAnimalSchema, updateAnimalSchema } from '../validations/animal.schema.js';
import { sanitizeObject } from '../utils/sanitizeInput.js';
import { uploadImagesToCloudinary } from '../controllers/upload.controller.js';
import { ZodError } from 'zod';
import { AuditLog } from '../models/AuditLog.model.js';
import { createAuditLog } from '../utils/createAuditLog.js';

export async function listAnimals(req, res) {
  const { category, categoryId } = req.query;
  const filter = { isActive: true };
  if (categoryId) filter.categoryId = categoryId;
  if (category) filter.species = category;
  // basic text search across name, breed, temperament and careNotes
  if (req.query.q) {
    const q = String(req.query.q).trim();
    if (q) {
      const re = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), 'i');
      filter.$or = [{ name: re }, { breed: re }, { temperament: re }, { careNotes: re }];
    }
  }
  const animals = await AnimalBaby.find(filter).sort({ createdAt: -1 });
  return res.json({ animals });
}

export async function getAnimal(req, res) {
  const animal = await AnimalBaby.findById(req.params.id);
  if (!animal || !animal.isActive) return res.status(404).json({ message: 'Animal not found' });
  return res.json({ animal });
}

export async function adminListAnimals(req, res) {
  const filter = {};
  if (typeof req.query.isActive !== 'undefined') filter.isActive = req.query.isActive === 'true';
  if (req.query.categoryId) filter.categoryId = req.query.categoryId;
  const animals = await AnimalBaby.find(filter).sort({ createdAt: -1 });
  return res.json({ animals });
}

export async function createAnimal(req, res) {
  try {
    const body = sanitizeObject(req.body);
    const data = createAnimalSchema.parse(body);
    // normalize common string->array fields when sent by form
    if (typeof data.purpose === 'string') data.purpose = data.purpose.split(',').map((s) => s.trim()).filter(Boolean);
    if (typeof data.temperament === 'string') data.temperament = data.temperament.split(',').map((s) => s.trim()).filter(Boolean);
    if (typeof data.vaccinations === 'string') data.vaccinations = data.vaccinations.split(',').map((s) => s.trim()).filter(Boolean);

    // ensure slug exists and is unique
    const makeSlug = (s) =>
      String(s || '')
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    let slug = data.slug || makeSlug(data.name);
    if (!slug) slug = `animal-${Date.now()}`;
    // ensure unique
    // if collision append timestamp
    // eslint-disable-next-line no-await-in-loop
    const exists = await AnimalBaby.findOne({ slug });
    if (exists) slug = `${slug}-${Date.now()}`;

    if (req.admin?._id) data.createdByAdminId = req.admin._id;
    const imageUrls = await uploadImagesToCloudinary(req.files || []);
    const animal = await AnimalBaby.create({ ...data, slug, images: imageUrls });
    if (req.admin?._id) {
      await AuditLog.create({ adminId: req.admin._id, action: 'CREATE', entityType: 'animal', entityId: animal._id });
    }
    return res.status(201).json({ animal });
  } catch (err) {
    if (err instanceof ZodError) {
      return res.status(400).json({ error: 'Validation failed', issues: err.issues });
    }
    // eslint-disable-next-line no-console
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function updateAnimal(req, res) {
  try {
    const body = sanitizeObject(req.body);
    const data = updateAnimalSchema.parse(body);

    // normalize arrays
    if (typeof data.purpose === 'string') data.purpose = data.purpose.split(',').map((s) => s.trim()).filter(Boolean);
    if (typeof data.temperament === 'string') data.temperament = data.temperament.split(',').map((s) => s.trim()).filter(Boolean);
    if (typeof data.vaccinations === 'string') data.vaccinations = data.vaccinations.split(',').map((s) => s.trim()).filter(Boolean);

    const imageUrls = req.files?.length ? await uploadImagesToCloudinary(req.files) : null;
    const update = imageUrls ? { ...data, $push: { images: { $each: imageUrls } } } : data;

    const animal = await AnimalBaby.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!animal) return res.status(404).json({ message: 'Animal not found' });
    if (req.admin?._id) {
      await AuditLog.create({ adminId: req.admin._id, action: 'UPDATE', entityType: 'animal', entityId: animal._id });
    }
    return res.json({ animal });
  } catch (err) {
    if (err instanceof ZodError) {
      return res.status(400).json({ error: 'Validation failed', issues: err.issues });
    }
    // eslint-disable-next-line no-console
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function deleteAnimal(req, res) {
  const animal = await AnimalBaby.findByIdAndDelete(req.params.id);
  if (!animal) return res.status(404).json({ message: 'Animal not found' });
  if (req.admin && req.admin._id) {
    await createAuditLog({ adminId: req.admin._id, action: 'DELETE', entityType: 'animal', entityId: animal._id });
  }
  return res.json({ ok: true });
}
