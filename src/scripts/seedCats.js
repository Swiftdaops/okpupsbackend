import { connectDb } from '../config/db.js';
import { AnimalBaby } from '../models/AnimalBaby.model.js';
import { Category } from '../models/Category.model.js';
import { slugify } from '../utils/sanitizeInput.js';

await connectDb();

const CATS = [
  { breed: 'Domestic Shorthair', priceUsd: 200, adultSize: 'medium', expLevel: 'beginner', livingSpace: 'apartment', temperament: ['Friendly', 'Adaptable'], aptSuitable: true },
  { breed: 'Domestic Longhair', priceUsd: 250, adultSize: 'medium', expLevel: 'beginner', livingSpace: 'apartment', temperament: ['Calm', 'Affectionate'], aptSuitable: true },
  { breed: 'British Shorthair', priceUsd: 1500, adultSize: 'medium', expLevel: 'beginner', livingSpace: 'apartment', temperament: ['Easygoing', 'Quiet'], aptSuitable: true },
  { breed: 'Persian', priceUsd: 1800, adultSize: 'medium', expLevel: 'beginner', livingSpace: 'apartment', temperament: ['Calm', 'Gentle'], aptSuitable: true },
  { breed: 'Maine Coon', priceUsd: 2000, adultSize: 'large', expLevel: 'beginner', livingSpace: 'compound', temperament: ['Sociable', 'Gentle'], aptSuitable: false },
  { breed: 'Ragdoll', priceUsd: 2000, adultSize: 'large', expLevel: 'beginner', livingSpace: 'apartment', temperament: ['Cuddly', 'Relaxed'], aptSuitable: true },
  { breed: 'Siamese', priceUsd: 1200, adultSize: 'medium', expLevel: 'intermediate', livingSpace: 'apartment', temperament: ['Vocal', 'Social'], aptSuitable: true },
  { breed: 'Bengal', priceUsd: 2500, adultSize: 'medium', expLevel: 'intermediate', livingSpace: 'compound', temperament: ['Energetic', 'Curious'], aptSuitable: false },
  { breed: 'Sphynx', priceUsd: 2500, adultSize: 'medium', expLevel: 'beginner', livingSpace: 'apartment', temperament: ['Affectionate', 'Playful'], aptSuitable: true },
  { breed: 'Scottish Fold', priceUsd: 1800, adultSize: 'medium', expLevel: 'beginner', livingSpace: 'apartment', temperament: ['Sweet', 'Easygoing'], aptSuitable: true },
  { breed: 'Russian Blue', priceUsd: 1600, adultSize: 'medium', expLevel: 'beginner', livingSpace: 'apartment', temperament: ['Gentle', 'Reserved'], aptSuitable: true },
  { breed: 'Abyssinian', priceUsd: 1600, adultSize: 'medium', expLevel: 'intermediate', livingSpace: 'compound', temperament: ['Active', 'Smart'], aptSuitable: false },
  { breed: 'American Shorthair', priceUsd: 1200, adultSize: 'medium', expLevel: 'beginner', livingSpace: 'apartment', temperament: ['Friendly', 'Balanced'], aptSuitable: true },
  { breed: 'Birman', priceUsd: 1700, adultSize: 'medium', expLevel: 'beginner', livingSpace: 'apartment', temperament: ['Gentle', 'Affectionate'], aptSuitable: true },
  { breed: 'Norwegian Forest Cat', priceUsd: 2000, adultSize: 'large', expLevel: 'beginner', livingSpace: 'compound', temperament: ['Calm', 'Independent'], aptSuitable: false },
  { breed: 'Oriental Shorthair', priceUsd: 1400, adultSize: 'medium', expLevel: 'intermediate', livingSpace: 'apartment', temperament: ['Vocal', 'Playful'], aptSuitable: true },
  { breed: 'Devon Rex', priceUsd: 1700, adultSize: 'small', expLevel: 'beginner', livingSpace: 'apartment', temperament: ['Mischievous', 'Social'], aptSuitable: true },
  { breed: 'Cornish Rex', priceUsd: 1700, adultSize: 'small', expLevel: 'beginner', livingSpace: 'apartment', temperament: ['Athletic', 'Outgoing'], aptSuitable: true },
  { breed: 'Himalayan', priceUsd: 1800, adultSize: 'medium', expLevel: 'beginner', livingSpace: 'apartment', temperament: ['Calm', 'Sweet'], aptSuitable: true },
  { breed: 'Turkish Angora', priceUsd: 1400, adultSize: 'medium', expLevel: 'intermediate', livingSpace: 'compound', temperament: ['Active', 'Elegant'], aptSuitable: false }
];

async function ensureCatCategory() {
  const candidateSlugs = ['cats', 'kittens', 'cat', 'kitten'];
  for (const s of candidateSlugs) {
    // eslint-disable-next-line no-await-in-loop
    const found = await Category.findOne({ slug: s });
    if (found) return found;
  }

  const slug = slugify('Cats');
  const doc = await Category.findOneAndUpdate(
    { slug },
    {
      $set: {
        name: 'Cats',
        type: 'pet',
        species: 'cat',
        parentId: null,
        slug
      }
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  // eslint-disable-next-line no-console
  console.log('Created/found category:', doc.name, doc._id.toString());
  return doc;
}

export async function seedCats() {
  const category = await ensureCatCategory();

  let upserted = 0;
  for (const cat of CATS) {
    // prefix to avoid collisions with any other animal slugs
    const slug = `cat-${slugify(cat.breed) || Date.now()}`;

    const data = {
      categoryId: category._id,
      name: `${cat.breed} Kitten`,
      slug,
      species: 'cat',
      breed: cat.breed,
      ageWeeks: 10,
      price: cat.priceUsd,
      quantityAvailable: 5,
      sex: Math.random() > 0.5 ? 'male' : 'female',

      purpose: ['companion'],
      temperament: cat.temperament,
      experienceLevel: cat.expLevel,
      livingSpace: cat.livingSpace,
      expectedAdultSize: cat.adultSize,

      suitability: {
        apartment: !!cat.aptSuitable,
        kidsFriendly: true,
        firstTimeOwner: cat.expLevel === 'beginner',
        guardPotential: false
      },

      healthStatus: {
        vaccinated: true,
        dewormed: true,
        vetCheckedAt: new Date(),
        notes: 'Health certified by breeder'
      },

      images: [
        `https://placehold.co/600x400?text=${encodeURIComponent(cat.breed)}+Kitten`
      ],
      careNotes: `Standard care for ${cat.breed} kittens.`
    };

    // eslint-disable-next-line no-await-in-loop
    await AnimalBaby.findOneAndUpdate(
      { slug },
      { $set: data },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    upserted += 1;
  }

  // eslint-disable-next-line no-console
  console.log(`Seeded cats: ${upserted}`);
}

if (process.argv[1] && process.argv[1].endsWith('seedCats.js')) {
  seedCats()
    .then(() => process.exit(0))
    .catch((err) => {
      // eslint-disable-next-line no-console
      console.error(err);
      process.exit(1);
    });
}
