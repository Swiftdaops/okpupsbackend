import { connectDb } from '../config/db.js';
import { AnimalBaby } from '../models/AnimalBaby.model.js';
import { slugify } from '../utils/sanitizeInput.js';
import mongoose from 'mongoose';

await connectDb();

export async function seedGermanShepherd() {
  const name = 'German Shepherd Puppy';
  const slug = slugify(name) || `animal-${Date.now()}`;

  const data = {
    categoryId: new mongoose.Types.ObjectId('64f100000000000000000001'), // Puppies
    name,
    slug,
    species: 'Dog',
    breed: 'German Shepherd',
    ageWeeks: 10,
    sex: 'male',
    price: 450000,
    quantityAvailable: 3,

    purpose: ['companion', 'security', 'breeding'],

    temperament: ['intelligent', 'loyal', 'alert', 'protective', 'trainable'],

    experienceLevel: 'intermediate',
    livingSpace: 'compound',

    healthStatus: {
      vaccinated: true,
      dewormed: true,
      vetCheckedAt: new Date('2025-01-05'),
      notes: 'Healthy, active puppy with clear eyes and strong posture'
    },

    vaccinations: [
      'DHPP (Distemper, Hepatitis, Parvovirus, Parainfluenza)',
      'Rabies (age-appropriate)'
    ],

    feedingGuide: {
      frequency: '3 times daily',
      quantity: '1.5 – 2 cups of puppy formula per day',
      notes: 'High-protein diet recommended for large-breed puppies'
    },

    careNotes: `
German Shepherd puppies require early training and socialization.
Daily exercise and mental stimulation are essential.
Avoid overfeeding to protect joint development.
`,

    images: [
      'https://cdn.okpups.com/animals/german-shepherd-1.jpg',
      'https://cdn.okpups.com/animals/german-shepherd-2.jpg',
      'https://cdn.okpups.com/animals/german-shepherd-3.jpg'
    ],

    availabilityStatus: 'available',
    location: 'Awka, Anambra State',
    isActive: true
  };

  // Upsert the document (create if missing, update if exists)
  const doc = await AnimalBaby.findOneAndUpdate(
    { slug },
    { $set: data },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  // eslint-disable-next-line no-console
  console.log('Upserted German Shepherd:', doc._id.toString());
}

// Run when executed directly
if (process.argv[1] && process.argv[1].endsWith('seedGermanShepherd.js')) {
  seedGermanShepherd()
    .then(() => process.exit(0))
    .catch((err) => {
      // eslint-disable-next-line no-console
      console.error(err);
      process.exit(1);
    });
}
