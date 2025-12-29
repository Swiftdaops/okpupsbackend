import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().min(1),
  type: z.enum(['pet', 'livestock']),
  species: z.string().min(1),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
});

export const updateCategorySchema = createCategorySchema.partial();
