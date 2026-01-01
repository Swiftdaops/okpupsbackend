import { connectDb } from '../config/db.js';
import { AnimalBaby } from '../models/AnimalBaby.model.js';
import { Category } from '../models/Category.model.js';
import { slugify } from '../utils/sanitizeInput.js';

await connectDb();

const DOGS = [
  { breed: 'Mixed Breed', priceUsd: 250, adultSize: 'medium', expLevel: 'beginner', livingSpace: 'apartment', temperament: ['Friendly', 'Varied'], aptSuitable: true },
  { breed: 'Labrador Retriever', priceUsd: 1200, adultSize: 'large', expLevel: 'beginner', livingSpace: 'compound', temperament: ['Active', 'Loyal'], aptSuitable: false },
  { breed: 'Golden Retriever', priceUsd: 1800, adultSize: 'large', expLevel: 'beginner', livingSpace: 'compound', temperament: ['Gentle', 'Eager'], aptSuitable: false },
  { breed: 'German Shepherd', priceUsd: 2200, adultSize: 'large', expLevel: 'intermediate', livingSpace: 'compound', temperament: ['Alert', 'Loyal'], aptSuitable: false },
  { breed: 'French Bulldog', priceUsd: 3500, adultSize: 'small', expLevel: 'beginner', livingSpace: 'apartment', temperament: ['Adaptable', 'Playful'], aptSuitable: true },
  { breed: 'Goldendoodle', priceUsd: 2500, adultSize: 'medium', expLevel: 'beginner', livingSpace: 'apartment', temperament: ['Smart', 'Social'], aptSuitable: true },
  { breed: 'Cockapoo', priceUsd: 1800, adultSize: 'small', expLevel: 'beginner', livingSpace: 'apartment', temperament: ['Happy', 'Outgoing'], aptSuitable: true },
  { breed: 'Labradoodle', priceUsd: 2200, adultSize: 'medium', expLevel: 'beginner', livingSpace: 'apartment', temperament: ['Social', 'Energetic'], aptSuitable: true },
  { breed: 'Bernedoodle', priceUsd: 3000, adultSize: 'large', expLevel: 'beginner', livingSpace: 'compound', temperament: ['Cuddly', 'Calm'], aptSuitable: false },
  { breed: 'Standard Poodle', priceUsd: 2500, adultSize: 'large', expLevel: 'beginner', livingSpace: 'compound', temperament: ['Elegant', 'Smart'], aptSuitable: false },
  { breed: 'Australian Shepherd', priceUsd: 1500, adultSize: 'medium', expLevel: 'intermediate', livingSpace: 'farm', temperament: ['High-energy', 'Work'], aptSuitable: false },
  { breed: 'Havanese', priceUsd: 1800, adultSize: 'small', expLevel: 'beginner', livingSpace: 'apartment', temperament: ['Cheerful', 'Smart'], aptSuitable: true },
  { breed: 'Shetland Sheepdog', priceUsd: 1500, adultSize: 'small', expLevel: 'intermediate', livingSpace: 'compound', temperament: ['Obedient', 'Vocal'], aptSuitable: true },
  { breed: 'Cavalier King Charles', priceUsd: 2800, adultSize: 'small', expLevel: 'beginner', livingSpace: 'apartment', temperament: ['Gentle', 'Affectionate'], aptSuitable: true },
  { breed: 'Bernese Mountain Dog', priceUsd: 2500, adultSize: 'large', expLevel: 'beginner', livingSpace: 'compound', temperament: ['Gentle', 'Giant'], aptSuitable: false },
  { breed: 'Shih Tzu', priceUsd: 1500, adultSize: 'small', expLevel: 'beginner', livingSpace: 'apartment', temperament: ['Affectionate', 'Calm'], aptSuitable: true },
  { breed: 'Chihuahua', priceUsd: 1200, adultSize: 'small', expLevel: 'beginner', livingSpace: 'apartment', temperament: ['Bold', 'Feisty'], aptSuitable: true },
  { breed: 'Yorkshire Terrier', priceUsd: 1800, adultSize: 'small', expLevel: 'beginner', livingSpace: 'apartment', temperament: ['Spirited', 'Bold'], aptSuitable: true },
  { breed: 'Dachshund', priceUsd: 1500, adultSize: 'small', expLevel: 'beginner', livingSpace: 'apartment', temperament: ['Clever', 'Lively'], aptSuitable: true },
  { breed: 'Border Collie', priceUsd: 1200, adultSize: 'medium', expLevel: 'intermediate', livingSpace: 'farm', temperament: ['Hyper-smart', 'Work'], aptSuitable: false },
  { breed: 'Siberian Husky', priceUsd: 1800, adultSize: 'large', expLevel: 'intermediate', livingSpace: 'compound', temperament: ['Energetic', 'Vocal'], aptSuitable: false },
  { breed: 'Pomeranian', priceUsd: 1800, adultSize: 'small', expLevel: 'beginner', livingSpace: 'apartment', temperament: ['Outgoing', 'Bold'], aptSuitable: true },
  { breed: 'Maltese', priceUsd: 1500, adultSize: 'small', expLevel: 'beginner', livingSpace: 'apartment', temperament: ['Playful', 'Docile'], aptSuitable: true },
  { breed: 'Beagle', priceUsd: 1200, adultSize: 'medium', expLevel: 'beginner', livingSpace: 'compound', temperament: ['Merry', 'Curious'], aptSuitable: false },
  { breed: 'Portuguese Water Dog', priceUsd: 1800, adultSize: 'medium', expLevel: 'beginner', livingSpace: 'compound', temperament: ['Athletic', 'Smart'], aptSuitable: false },
  { breed: 'Mini American Shepherd', priceUsd: 1500, adultSize: 'medium', expLevel: 'intermediate', livingSpace: 'compound', temperament: ['High-drive', 'Alert'], aptSuitable: true },
  { breed: 'Saint Bernard', priceUsd: 1500, adultSize: 'large', expLevel: 'intermediate', livingSpace: 'farm', temperament: ['Gentle', 'Patient'], aptSuitable: false },
  { breed: 'Belgian Malinois', priceUsd: 1800, adultSize: 'large', expLevel: 'intermediate', livingSpace: 'compound', temperament: ['Focused', 'High-drive'], aptSuitable: false },
  { breed: 'Rhodesian Ridgeback', priceUsd: 2200, adultSize: 'large', expLevel: 'intermediate', livingSpace: 'compound', temperament: ['Independent', 'Loyal'], aptSuitable: false },
  { breed: 'Samoyed', priceUsd: 4500, adultSize: 'medium', expLevel: 'intermediate', livingSpace: 'compound', temperament: ['Smiling', 'Gentle'], aptSuitable: false },
  { breed: 'English Bulldog', priceUsd: 3500, adultSize: 'medium', expLevel: 'beginner', livingSpace: 'apartment', temperament: ['Lazy', 'Friendly'], aptSuitable: true },
  { breed: 'Maltipoo', priceUsd: 2200, adultSize: 'small', expLevel: 'beginner', livingSpace: 'apartment', temperament: ['Cuddly', 'Playful'], aptSuitable: true },
  { breed: 'Cavapoo', priceUsd: 2500, adultSize: 'small', expLevel: 'beginner', livingSpace: 'apartment', temperament: ['Social', 'Calm'], aptSuitable: true },
  { breed: 'Chow Chow', priceUsd: 2800, adultSize: 'medium', expLevel: 'intermediate', livingSpace: 'compound', temperament: ['Dignified', 'Aloof'], aptSuitable: false },
  { breed: 'Akita (Japanese)', priceUsd: 4000, adultSize: 'large', expLevel: 'intermediate', livingSpace: 'compound', temperament: ['Protective', 'Brave'], aptSuitable: false },
  { breed: 'Saluki', priceUsd: 3500, adultSize: 'medium', expLevel: 'intermediate', livingSpace: 'compound', temperament: ['Reserved', 'Fast'], aptSuitable: false },
  { breed: 'Great Dane', priceUsd: 1800, adultSize: 'large', expLevel: 'beginner', livingSpace: 'compound', temperament: ['Easygoing', 'Patient'], aptSuitable: false },
  { breed: 'Boxer', priceUsd: 1500, adultSize: 'large', expLevel: 'beginner', livingSpace: 'compound', temperament: ['Playful', 'Devoted'], aptSuitable: false },
  { breed: 'Rottweiler', priceUsd: 2500, adultSize: 'large', expLevel: 'intermediate', livingSpace: 'compound', temperament: ['Guardian', 'Loyal'], aptSuitable: false },
  { breed: 'Australian Cattle Dog', priceUsd: 1200, adultSize: 'medium', expLevel: 'intermediate', livingSpace: 'farm', temperament: ['Hardy', 'Energetic'], aptSuitable: false },
  { breed: 'Basset Hound', priceUsd: 1500, adultSize: 'medium', expLevel: 'beginner', livingSpace: 'apartment', temperament: ['Patient', 'Low-drive'], aptSuitable: true },
  { breed: 'Vizsla', priceUsd: 1800, adultSize: 'medium', expLevel: 'intermediate', livingSpace: 'compound', temperament: ['Sensitive', 'Active'], aptSuitable: false },
  { breed: 'Doberman Pinscher', priceUsd: 1800, adultSize: 'large', expLevel: 'intermediate', livingSpace: 'compound', temperament: ['Alert', 'Fearless'], aptSuitable: false },
  { breed: 'Pug', priceUsd: 1500, adultSize: 'small', expLevel: 'beginner', livingSpace: 'apartment', temperament: ['Comical', 'Docile'], aptSuitable: true },
  { breed: 'Cane Corso', priceUsd: 2800, adultSize: 'large', expLevel: 'intermediate', livingSpace: 'farm', temperament: ['Majestic', 'Intense'], aptSuitable: false },
  { breed: 'Boston Terrier', priceUsd: 1500, adultSize: 'small', expLevel: 'beginner', livingSpace: 'apartment', temperament: ['Bright', 'Friendly'], aptSuitable: true },
  { breed: 'Soft-Coated Wheaten', priceUsd: 1800, adultSize: 'medium', expLevel: 'beginner', livingSpace: 'compound', temperament: ['Happy', 'Bouncy'], aptSuitable: true },
  { breed: 'Miniature Schnauzer', priceUsd: 1500, adultSize: 'small', expLevel: 'beginner', livingSpace: 'apartment', temperament: ['Spirited', 'Smart'], aptSuitable: true },
  { breed: 'Weimaraner', priceUsd: 1500, adultSize: 'large', expLevel: 'intermediate', livingSpace: 'compound', temperament: ['Swift', 'Alert'], aptSuitable: false },
  { breed: 'Pembroke Welsh Corgi', priceUsd: 1500, adultSize: 'small', expLevel: 'beginner', livingSpace: 'apartment', temperament: ['Bold', 'Outgoing'], aptSuitable: true }
];

function guardPotentialFor(breed) {
  const b = String(breed || '').toLowerCase();
  return (
    b.includes('shepherd') ||
    b.includes('rottweiler') ||
    b.includes('doberman') ||
    b.includes('malinois') ||
    b.includes('cane corso') ||
    b.includes('akita')
  );
}

async function ensureDogCategory() {
  const candidateSlugs = ['dogs', 'puppies', 'dog', 'puppy'];
  for (const s of candidateSlugs) {
    // eslint-disable-next-line no-await-in-loop
    const found = await Category.findOne({ slug: s });
    if (found) return found;
  }

  const slug = slugify('Dogs');
  const doc = await Category.findOneAndUpdate(
    { slug },
    {
      $set: {
        name: 'Dogs',
        type: 'pet',
        species: 'dog',
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

export async function seedDogs() {
  const category = await ensureDogCategory();

  let upserted = 0;
  for (const dog of DOGS) {
    const baseSlug = slugify(dog.breed) || `dog-${Date.now()}`;

    const data = {
      categoryId: category._id,
      name: `${dog.breed} Puppy`,
      slug: baseSlug,
      species: 'dog',
      breed: dog.breed,
      ageWeeks: 10,
      price: dog.priceUsd,
      quantityAvailable: 5,
      sex: Math.random() > 0.5 ? 'male' : 'female',

      purpose: ['companion'],
      temperament: dog.temperament,
      experienceLevel: dog.expLevel,
      livingSpace: dog.livingSpace,
      expectedAdultSize: dog.adultSize,

      suitability: {
        apartment: !!dog.aptSuitable,
        kidsFriendly: true,
        firstTimeOwner: dog.expLevel === 'beginner',
        guardPotential: guardPotentialFor(dog.breed)
      },

      healthStatus: {
        vaccinated: true,
        dewormed: true,
        vetCheckedAt: new Date(),
        notes: 'Health certified by breeder'
      },

      images: [
        `https://placehold.co/600x400?text=${encodeURIComponent(dog.breed)}+Puppy`
      ],
      careNotes: `Standard care for ${dog.breed} puppies.`
    };

    // Upsert by slug so re-running is safe.
    // eslint-disable-next-line no-await-in-loop
    await AnimalBaby.findOneAndUpdate(
      { slug: baseSlug },
      { $set: data },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    upserted += 1;
  }

  // eslint-disable-next-line no-console
  console.log(`Seeded dogs: ${upserted}`);
}

if (process.argv[1] && process.argv[1].endsWith('seedDogs.js')) {
  seedDogs()
    .then(() => process.exit(0))
    .catch((err) => {
      // eslint-disable-next-line no-console
      console.error(err);
      process.exit(1);
    });
}
