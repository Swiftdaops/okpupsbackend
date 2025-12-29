import { AnimalStats } from '../models/AnimalStats.model.js';
import { ProductStats } from '../models/ProductStats.model.js';
import { AnimalLike } from '../models/AnimalLike.model.js';

export async function likeAnimal(req, res) {
  const { id } = req.params;
  const clientId = (req.header('x-client-id') || '').trim();
  if (!clientId) {
    // If no clientId provided, still allow increment but warn client should send an id
    const stats = await AnimalStats.findOneAndUpdate(
      { animalId: id },
      { $inc: { likesCount: 1 } },
      { upsert: true, new: true }
    );
    return res.json({ stats, created: true, note: 'no-client-id' });
  }

  try {
    // Attempt to create a unique like record; if it already exists, skip increment
    await AnimalLike.create({ animalId: id, clientId });
    const stats = await AnimalStats.findOneAndUpdate(
      { animalId: id },
      { $inc: { likesCount: 1 } },
      { upsert: true, new: true }
    );
    return res.json({ stats, created: true });
  } catch (err) {
    // duplicate key -> already liked
    if (err && err.code === 11000) {
      const stats = await AnimalStats.findOne({ animalId: id });
      return res.json({ stats, created: false, alreadyLiked: true });
    }
    // other errors
    // eslint-disable-next-line no-console
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getAnimalStats(req, res) {
  const { id } = req.params;
  const stats = await AnimalStats.findOne({ animalId: id }) || { likesCount: 0, orderCount: 0 };
  return res.json({ stats });
}

export async function adminTopAnimals(req, res) {
  const by = (req.query.by || 'likes').toLowerCase();
  const sort = by === 'orders' ? { orderCount: -1 } : { likesCount: -1 };
  const limit = Math.min(Number(req.query.limit || 10), 50);
  const items = await AnimalStats.find({}).sort(sort).limit(limit);
  return res.json({ items });
}

export async function adminTopProducts(req, res) {
  const by = (req.query.by || 'orders').toLowerCase();
  const sort = by === 'likes' ? { likesCount: -1 } : { orderCount: -1 };
  const limit = Math.min(Number(req.query.limit || 10), 50);
  const items = await ProductStats.find({}).sort(sort).limit(limit);
  return res.json({ items });
}

export async function likeProduct(req, res) {
  const { id } = req.params;
  const stats = await ProductStats.findOneAndUpdate(
    { productId: id },
    { $inc: { likesCount: 1 } },
    { upsert: true, new: true }
  );
  return res.json({ stats });
}
