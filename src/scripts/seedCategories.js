import { connectDb } from '../config/db.js';
import { Category } from '../models/Category.model.js';

await connectDb();

const items = [
  { name: 'Companion Animals', type: 'pet', species: 'general', slug: 'companion-animals' },
  { name: 'Farm Animals', type: 'livestock', species: 'general', slug: 'farm-animals' },
  { name: 'Poultry', type: 'livestock', species: 'poultry', slug: 'poultry' },
  { name: 'Livestock (Commercial)', type: 'livestock', species: 'commercial', slug: 'livestock-commercial' },
  // product categories
  { name: 'Dog Food', type: 'product', species: 'dog', slug: 'dog-food' },
  { name: 'Cat Food', type: 'product', species: 'cat', slug: 'cat-food' },
  { name: 'Livestock Feed', type: 'product', species: 'livestock', slug: 'livestock-feed' }
];

for (const it of items) {
  const existing = await Category.findOne({ slug: it.slug });
  if (existing) {
    // eslint-disable-next-line no-console
    console.log('Category exists:', it.slug);
    continue;
  }
  await Category.create(it);
  // eslint-disable-next-line no-console
  console.log('Created category:', it.slug);
}

process.exit(0);
