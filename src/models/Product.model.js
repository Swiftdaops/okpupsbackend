import mongoose from 'mongoose';

/* -----------------------------
   Product Specs (Embedded)
------------------------------ */
const ProductSpecsSchema = new mongoose.Schema(
  {
    weight: { type: String, default: '' },               // e.g. 10kg
    proteinPercent: { type: String, default: '' },       // e.g. 26%
    ingredients: { type: String, default: '' },
    fatPercent: { type: String, default: '' },
    fiberPercent: { type: String, default: '' }
  },
  { _id: false }
);

/* -----------------------------
   Product Schema
------------------------------ */
const ProductSchema = new mongoose.Schema(
  {
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
      index: true
    },

    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },

    brand: { type: String, default: '', trim: true },

    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0 },

    availabilityStatus: {
      type: String,
      enum: ['in_stock', 'low_stock', 'out_of_stock'],
      default: 'in_stock'
    },

    /* Suitability */
    speciesSuitability: {
      type: [String],
      enum: ['dog', 'cat', 'poultry', 'livestock'],
      required: true
    },

    ageSuitability: {
      type: [String],
      enum: ['puppy', 'kitten', 'adult', 'all'],
      default: ['all']
    },

    purpose: {
      type: [String],
      enum: ['nutrition', 'health', 'grooming', 'farm_use', 'supplement'],
      default: ['nutrition']
    },

    /* Feeding & Vet Info */
    feedingInstructions: { type: String, default: '' },
    nutritionHighlights: { type: String, default: '' },

    vetApproved: { type: Boolean, default: false },

    specs: {
      type: ProductSpecsSchema,
      default: () => ({})
    },

    images: { type: [String], default: [] },

    createdByAdminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin'
    },

    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

/* -----------------------------
   Indexes
------------------------------ */
ProductSchema.index({
  categoryId: 1,
  isActive: 1,
  availabilityStatus: 1,
  createdAt: -1
});

export const Product = mongoose.model('Product', ProductSchema);
