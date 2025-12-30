import { connectDb } from '../config/db.js';
import { Category } from '../models/Category.model.js';
import { Product } from '../models/Product.model.js';

await connectDb();

async function ensureCategory() {
  const slug = 'dog-food';
  let cat = await Category.findOne({ slug });
  if (!cat) {
    cat = await Category.create({ name: 'Dog Food', type: 'product', species: 'dog', slug });
    // eslint-disable-next-line no-console
    console.log('Created category:', slug);
  } else {
    // eslint-disable-next-line no-console
    console.log('Category exists:', slug);
  }
  return cat;
}

async function assignCategoryToProducts(cat) {
  // heuristic: products that mention "dog" or "puppy" in name/brand, or list speciesSuitability includes 'dog', or purpose includes 'nutrition'
  const nameRegex = /dog|puppy|pupp(y|ies)/i;

  const products = await Product.find({ isActive: true });
  let updated = 0;
  for (const p of products) {
    const looksLikeDogFood = (
      (p.name && nameRegex.test(p.name)) ||
      (p.brand && nameRegex.test(p.brand)) ||
      (Array.isArray(p.speciesSuitability) && p.speciesSuitability.includes('dog')) ||
      (Array.isArray(p.purpose) && p.purpose.includes('nutrition') && Array.isArray(p.speciesSuitability) && p.speciesSuitability.length === 0 ? true : false)
    );
    if (looksLikeDogFood) {
      if (!p.categoryId || String(p.categoryId) !== String(cat._id)) {
        p.categoryId = cat._id;
        await p.save();
        updated += 1;
        // eslint-disable-next-line no-console
        console.log('Updated product:', p._id, p.name);
      }
    }
  }
  // eslint-disable-next-line no-console
  console.log('Done. Products updated:', updated);
}

(async function main() {
  try {
    const cat = await ensureCategory();
    await assignCategoryToProducts(cat);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
  } finally {
    process.exit(0);
  }
})();
