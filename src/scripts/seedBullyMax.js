import { connectDb } from '../config/db.js';
import { Product } from '../models/Product.model.js';
import { Category } from '../models/Category.model.js';
import { slugify } from '../utils/sanitizeInput.js';
import mongoose from 'mongoose';

await connectDb();

export async function seedBullyMax() {
  const name = 'Bully Max High-Performance Dog Food';
  const slug = slugify(name) || `product-${Date.now()}`;

  // try to find an existing dog food category
  const candidateSlugs = ['puppy-food', 'adult-dog-food', 'dog-nutrition', 'dog-food'];
  let category = null;
  for (const s of candidateSlugs) {
    // eslint-disable-next-line no-await-in-loop
    category = await Category.findOne({ slug: s });
    if (category) break;
  }

  // if not found, create a simple 'Dog Food' category
  if (!category) {
    const cSlug = slugify('Dog Food');
    category = await Category.findOneAndUpdate(
      { slug: cSlug },
      {
        $set: {
          name: 'Dog Food',
          type: 'product',
          species: 'dog',
          parentId: null,
          slug: cSlug
        }
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    // eslint-disable-next-line no-console
    console.log('Created/found category:', category.name, category._id.toString());
  }

  const data = {
    categoryId: category._id,
    name,
    slug,
    brand: 'Bully Max',
    price: 75000,
    stock: 50,
    ageSuitability: ['puppy', 'all'],
    feedingInstructions: 'Feed according to weight and activity level; see packaging for details',
    nutritionHighlights: 'High protein, high calories, rich in vitamins & minerals',
    vetApproved: false,
    specs: {
      weight: '5kg',
      proteinPercent: '30%',
      ingredients: 'Natural chicken meal, corn, rice, vitamins & minerals'
    },
    images: [
      'https://res.cloudinary.com/dzifobwnx/image/upload/v1766693595/3020-beef-front-BM_ygbsis.webp'
    ],
    isActive: true
  };

  const doc = await Product.findOneAndUpdate({ slug }, { $set: data }, { upsert: true, new: true, setDefaultsOnInsert: true });
  // eslint-disable-next-line no-console
  console.log('Upserted product:', doc._id.toString(), 'categoryId:', String(category._id));
}

if (process.argv[1] && process.argv[1].endsWith('seedBullyMax.js')) {
  seedBullyMax()
    .then(() => process.exit(0))
    .catch((err) => {
      // eslint-disable-next-line no-console
      console.error(err);
      process.exit(1);
    });
}
