import { z } from 'zod';

export const createAnimalSchema = z.object({
  categoryId: z.string().min(1),
  name: z.string().min(1),
  slug: z.string().optional(),
  species: z.string().min(1),
  breed: z.string().optional(),
  ageWeeks: z.coerce.number().int().min(0),
  sex: z.enum(['male', 'female', 'unknown']).optional(),
  price: z.coerce.number().min(0),
  quantityAvailable: z.coerce.number().int().min(0).default(1),
  purpose: z.array(z.enum(['companion', 'security', 'breeding', 'farming'])).optional(),
  temperament: z.array(z.string()).optional(),
  experienceLevel: z.enum(['beginner', 'intermediate']).optional(),
  livingSpace: z.enum(['apartment', 'compound', 'farm']).optional(),
  expectedAdultSize: z.enum(['small', 'medium', 'large']).optional(),
  suitability: z
    .object({
      apartment: z.coerce.boolean().optional(),
      kidsFriendly: z.coerce.boolean().optional(),
      firstTimeOwner: z.coerce.boolean().optional(),
      guardPotential: z.coerce.boolean().optional()
    })
    .optional(),
  healthStatus: z
    .object({
      vaccinated: z.coerce.boolean().optional(),
      dewormed: z.coerce.boolean().optional(),
      vetCheckedAt: z.string().optional(),
      notes: z.string().optional()
    })
    .optional(),
  vaccinations: z.array(z.string()).optional(),
  feedingGuide: z
    .object({
      frequency: z.string().optional(),
      quantity: z.string().optional(),
      notes: z.string().optional()
    })
    .optional(),
  careNotes: z.string().optional(),
  availabilityStatus: z.enum(['available', 'reserved', 'sold']).optional(),
  location: z.string().optional(),
  createdByAdminId: z.string().optional(),
  vaccinations: z.array(z.string()).optional(),
  isActive: z.coerce.boolean().optional()
});

export const updateAnimalSchema = createAnimalSchema.partial();
