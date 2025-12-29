import { connectDb } from '../config/db.js';
import { Category } from '../models/Category.model.js';
import { slugify } from '../utils/sanitizeInput.js';

await connectDb();

export async function seedVetProductCategories() {
  const categories = [
    { name: 'Vet Products', type: 'product' },

    { name: 'Dog Nutrition', parent: 'Vet Products' },
    { name: 'Puppy Food', parent: 'Dog Nutrition' },
    { name: 'Adult Dog Food', parent: 'Dog Nutrition' },
    { name: 'Dog Supplements', parent: 'Dog Nutrition' },

    { name: 'Cat Nutrition', parent: 'Vet Products' },
    { name: 'Kitten Food', parent: 'Cat Nutrition' },
    { name: 'Adult Cat Food', parent: 'Cat Nutrition' },

    { name: 'Poultry Feed', parent: 'Vet Products' },
    { name: 'Starter Mash', parent: 'Poultry Feed' },
    { name: 'Grower Mash', parent: 'Poultry Feed' },
    { name: 'Layer Feed', parent: 'Poultry Feed' },

    { name: 'Livestock Feed', parent: 'Vet Products' },
    { name: 'Calf Starter', parent: 'Livestock Feed' },
    { name: 'Goat Feed', parent: 'Livestock Feed' },
    { name: 'Sheep Feed', parent: 'Livestock Feed' },

    { name: 'Health & Supplements', parent: 'Vet Products' },
    { name: 'Vitamins', parent: 'Health & Supplements' },
    { name: 'Dewormers', parent: 'Health & Supplements' },
    { name: 'Immune Boosters', parent: 'Health & Supplements' },

    { name: 'Grooming & Hygiene', parent: 'Vet Products' },
    { name: 'Shampoos', parent: 'Grooming & Hygiene' },
    { name: 'Disinfectants', parent: 'Grooming & Hygiene' }
  ];

  const categoryMap = {};

  for (const cat of categories) {
    const slug = slugify(cat.name);
    const parentId = cat.parent ? categoryMap[cat.parent] : null;
    const data = {
      name: cat.name,
      type: cat.type || 'product',
      parentId,
      slug
    };

    const doc = await Category.findOneAndUpdate({ slug }, { $set: data }, { upsert: true, new: true });
    categoryMap[cat.name] = doc._id;
    console.log(`Upserted category: ${cat.name} (${doc._id})`);
  }

  console.log('Vet product categories seeded successfully');
}

// run when executed directly
if (process.argv[1].endsWith('seedVetProductCategories.js')) {
  seedVetProductCategories()
    .then(() => process.exit(0))
    .catch((err) => {
      // eslint-disable-next-line no-console
      console.error(err);
      process.exit(1);
    });
}
