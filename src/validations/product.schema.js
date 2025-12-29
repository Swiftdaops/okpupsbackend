import { z } from 'zod';

export const createProductSchema = z.object({
  categoryId: z.string().min(1),
  name: z.string().min(1),
  brand: z.string().optional(),
  price: z.coerce.number().min(0),
  stock: z.coerce.number().int().min(0),
  ageSuitability: z.array(z.string()).optional(),
  feedingInstructions: z.string().optional(),
  nutritionHighlights: z.string().optional(),
  specs: z
    .object({
      weight: z.string().optional(),
      proteinPercent: z.string().optional(),
      ingredients: z.string().optional()
    })
    .optional(),
  isActive: z.coerce.boolean().optional()
});

export const updateProductSchema = createProductSchema.partial();
