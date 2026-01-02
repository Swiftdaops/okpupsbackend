import { connectDb } from '../config/db.js';
import { Category } from '../models/Category.model.js';
import { AnimalBaby } from '../models/AnimalBaby.model.js';
import { Product } from '../models/Product.model.js';
import { slugify } from '../utils/sanitizeInput.js';

await connectDb();

function parseUsd(v) {
  const s = String(v || '').trim();
  if (!s) return 0;
  const n = Number(s.replace(/[^0-9.]/g, ''));
  return Number.isFinite(n) ? n : 0;
}

function ageWeeksFor(unit) {
  const u = String(unit || '').toLowerCase();
  if (u.includes('chick')) return 1;
  if (u.includes('pullet')) return 16;
  if (u.includes('kid')) return 10;
  if (u.includes('lamb')) return 12;
  if (u.includes('heifer')) return 40;
  if (u.includes('calf')) return 12;
  return 12;
}

function qtyFor(categorySlug, unit) {
  const u = String(unit || '').toLowerCase();
  if (u.includes('bulk')) return 50;
  if (categorySlug === 'chickens') return 20;
  if (categorySlug === 'goats') return 8;
  if (categorySlug === 'sheep') return 6;
  if (categorySlug === 'cattle') return 3;
  return 5;
}

async function upsertCategory({ name, type, species, slug }) {
  return Category.findOneAndUpdate(
    { slug },
    {
      $set: {
        name,
        type,
        species,
        parentId: null,
        slug
      }
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
}

const LIVESTOCK_TABLE = [
  // CATTLE
  { category: 'CATTLE', categorySlug: 'cattle', species: 'cattle', breed: 'American Wagyu', priceUsd: '$3,500', unit: 'per Calf' },
  { category: 'CATTLE', categorySlug: 'cattle', species: 'cattle', breed: 'Mini Highland', priceUsd: '$2,500', unit: 'per Calf' },
  { category: 'CATTLE', categorySlug: 'cattle', species: 'cattle', breed: 'Mini Jersey', priceUsd: '$2,000', unit: 'per Calf' },
  { category: 'CATTLE', categorySlug: 'cattle', species: 'cattle', breed: 'Holstein (Dairy)', priceUsd: '$1,400', unit: 'per Heifer' },
  { category: 'CATTLE', categorySlug: 'cattle', species: 'cattle', breed: 'Black Angus', priceUsd: '$1,200', unit: 'per Calf' },
  { category: 'CATTLE', categorySlug: 'cattle', species: 'cattle', breed: 'Dexter', priceUsd: '$1,200', unit: 'per Calf' },
  { category: 'CATTLE', categorySlug: 'cattle', species: 'cattle', breed: 'Hereford', priceUsd: '$1,100', unit: 'per Calf' },

  // GOATS
  { category: 'GOATS', categorySlug: 'goats', species: 'goat', breed: 'Angora (Fiber)', priceUsd: '$500', unit: 'per Kid' },
  { category: 'GOATS', categorySlug: 'goats', species: 'goat', breed: 'Boer (Meat)', priceUsd: '$450', unit: 'per Kid' },
  { category: 'GOATS', categorySlug: 'goats', species: 'goat', breed: 'Myotonic (Fainting)', priceUsd: '$400', unit: 'per Kid' },
  { category: 'GOATS', categorySlug: 'goats', species: 'goat', breed: 'Mini Nubian', priceUsd: '$400', unit: 'per Kid' },
  { category: 'GOATS', categorySlug: 'goats', species: 'goat', breed: 'Saanen / Alpine', priceUsd: '$350', unit: 'per Kid' },
  { category: 'GOATS', categorySlug: 'goats', species: 'goat', breed: 'Nigerian Dwarf', priceUsd: '$300', unit: 'per Kid' },
  { category: 'GOATS', categorySlug: 'goats', species: 'goat', breed: 'Spanish (Brush)', priceUsd: '$300', unit: 'per Kid' },

  // CHICKENS
  { category: 'CHICKENS', categorySlug: 'chickens', species: 'poultry', breed: 'Silkie', priceUsd: '$25', unit: 'per Pullet' },
  { category: 'CHICKENS', categorySlug: 'chickens', species: 'poultry', breed: 'Brahma', priceUsd: '$18', unit: 'per Pullet' },
  { category: 'CHICKENS', categorySlug: 'chickens', species: 'poultry', breed: 'Black Copper Maran', priceUsd: '$15', unit: 'per Pullet' },
  { category: 'CHICKENS', categorySlug: 'chickens', species: 'poultry', breed: 'Buff Orpington', priceUsd: '$14', unit: 'per Pullet' },
  { category: 'CHICKENS', categorySlug: 'chickens', species: 'poultry', breed: 'Rhode Island Red', priceUsd: '$12', unit: 'per Pullet' },
  { category: 'CHICKENS', categorySlug: 'chickens', species: 'poultry', breed: 'White Leghorn', priceUsd: '$5', unit: 'per Chick (Bulk)' },
  { category: 'CHICKENS', categorySlug: 'chickens', species: 'poultry', breed: 'Cornish Cross', priceUsd: '$4', unit: 'per Chick (Bulk)' },

  // SHEEP
  { category: 'SHEEP', categorySlug: 'sheep', species: 'sheep', breed: 'Valais Blacknose', priceUsd: '$1,500', unit: 'per Lamb' },
  { category: 'SHEEP', categorySlug: 'sheep', species: 'sheep', breed: 'Southdown Babydoll', priceUsd: '$800', unit: 'per Lamb' },
  { category: 'SHEEP', categorySlug: 'sheep', species: 'sheep', breed: 'Merino', priceUsd: '$450', unit: 'per Lamb' },
  { category: 'SHEEP', categorySlug: 'sheep', species: 'sheep', breed: 'Dorper / Katahdin', priceUsd: '$325', unit: 'per Lamb' }
];

async function seedLivestockCategories() {
  const categories = [
    { name: 'Cattle', type: 'livestock', species: 'cattle', slug: 'cattle' },
    { name: 'Goats', type: 'livestock', species: 'goat', slug: 'goats' },
    { name: 'Chickens', type: 'livestock', species: 'poultry', slug: 'chickens' },
    { name: 'Sheep', type: 'livestock', species: 'sheep', slug: 'sheep' }
  ];

  const map = new Map();
  for (const c of categories) {
    // eslint-disable-next-line no-await-in-loop
    const doc = await upsertCategory(c);
    map.set(c.slug, doc);
    // eslint-disable-next-line no-console
    console.log('Category:', doc.slug, doc._id.toString());
  }
  return map;
}

async function seedLivestocksAnimals(categoryMap) {
  let upserted = 0;

  for (const row of LIVESTOCK_TABLE) {
    const categoryDoc = categoryMap.get(row.categorySlug);
    if (!categoryDoc) continue;

    const price = parseUsd(row.priceUsd);
    const ageWeeks = ageWeeksFor(row.unit);
    const quantityAvailable = qtyFor(row.categorySlug, row.unit);

    const base = `${row.categorySlug}-${slugify(row.breed)}`;
    const slug = base || `${row.categorySlug}-${Date.now()}`;

    const data = {
      categoryId: categoryDoc._id,
      name: `${row.breed} ${row.unit.replace(/^per\s+/i, '').trim()}`,
      slug,
      species: row.species,
      breed: row.breed,
      ageWeeks,
      price,
      quantityAvailable,
      sex: Math.random() > 0.5 ? 'male' : 'female',

      purpose: ['farming'],
      temperament: [],
      experienceLevel: 'beginner',
      livingSpace: 'farm',
      expectedAdultSize: row.categorySlug === 'chickens' ? 'small' : row.categorySlug === 'goats' ? 'medium' : 'large',

      suitability: {
        apartment: false,
        kidsFriendly: true,
        firstTimeOwner: true,
        guardPotential: false
      },

      healthStatus: {
        vaccinated: true,
        dewormed: true,
        vetCheckedAt: new Date(),
        notes: 'Seeded demo livestock listing'
      },

      images: [
        `https://placehold.co/600x400?text=${encodeURIComponent(row.breed)}`
      ],
      careNotes: `Demo listing for ${row.breed} (${row.unit}).`
    };

    // Upsert by slug so re-running is safe.
    // eslint-disable-next-line no-await-in-loop
    await AnimalBaby.findOneAndUpdate(
      { slug },
      { $set: data },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    upserted += 1;
  }

  // eslint-disable-next-line no-console
  console.log(`Seeded livestock animals: ${upserted}`);
}

async function seedEggsProduct() {
  // Ensure a product category for eggs.
  const eggsCategory = await upsertCategory({
    name: 'Eggs',
    type: 'product',
    species: 'poultry',
    slug: 'eggs'
  });

  const priceUsd = parseUsd(process.env.EGGS_PRICE_USD || '0');
  const stock = Number(process.env.EGGS_STOCK || 20);

  const productSlug = 'eggs-crate';
  const product = {
    categoryId: eggsCategory._id,
    name: 'Eggs (1 crate)',
    slug: productSlug,
    brand: 'OKPUPS Farm',
    price: priceUsd,
    stock,
    speciesSuitability: ['poultry', 'livestock'],
    ageSuitability: ['all'],
    purpose: ['farm_use'],
    vetApproved: true,
    nutritionHighlights: 'Fresh farm eggs. Unit: 1 crate.',
    feedingInstructions: '',
    specs: { weight: '1 crate' },
    images: ['https://placehold.co/600x400?text=Eggs+Crate'],
    isActive: true
  };

  await Product.findOneAndUpdate(
    { slug: productSlug },
    { $set: product },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  // eslint-disable-next-line no-console
  console.log(`Seeded product: ${product.name} (stock=${stock}, price=${priceUsd})`);
  if (!priceUsd) {
    // eslint-disable-next-line no-console
    console.warn('EGGS_PRICE_USD not set; eggs price seeded as 0. Set EGGS_PRICE_USD to update.');
  }
}

export async function seedLivestocks() {
  const categoryMap = await seedLivestockCategories();
  await seedLivestocksAnimals(categoryMap);
  await seedEggsProduct();
}

if (process.argv[1] && process.argv[1].endsWith('seedLivestocks.js')) {
  seedLivestocks()
    .then(() => process.exit(0))
    .catch((err) => {
      // eslint-disable-next-line no-console
      console.error(err);
      process.exit(1);
    });
}
