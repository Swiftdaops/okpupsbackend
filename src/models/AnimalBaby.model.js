import mongoose from 'mongoose';

/* -----------------------------
   Feeding Guide (Embedded)
------------------------------ */
const FeedingGuideSchema = new mongoose.Schema(
  {
    frequency: { type: String, default: '' },
    quantity: { type: String, default: '' },
    notes: { type: String, default: '' }
  },
  { _id: false }
);

/* -----------------------------
   Animal Baby Schema
------------------------------ */
const AnimalBabySchema = new mongoose.Schema(
  {
    /* Category & Identity */
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
      index: true
    },

    name: { type: String, required: true, trim: true },

    // Legacy supporta
    nameOrTag: { type: String, trim: true },

    slug: {
      type: String,
      required: true,
      unique: true,
      index: true
    },

    species: { type: String, required: true, trim: true },
    breed: { type: String, default: '', trim: true },

    /* Age & Pricing */
    ageWeeks: { type: Number, required: true, min: 0 },
    price: { type: Number, required: true, min: 0 },

    quantityAvailable: {
      type: Number,
      required: true,
      min: 0,
      default: 1
    },

    sex: {
      type: String,
      enum: ['male', 'female', 'unknown'],
      default: 'unknown'
    },

    /* Purpose & Behavior */
    purpose: {
      type: [String],
      enum: ['companion', 'security', 'breeding', 'farming'],
      default: ['companion']
    },

    temperament: { type: [String], default: [] },

    experienceLevel: {
      type: String,
      enum: ['beginner', 'intermediate'],
      default: 'beginner'
    },

    livingSpace: {
      type: String,
      enum: ['apartment', 'compound', 'farm'],
      default: 'apartment'
    },

    expectedAdultSize: {
      type: String,
      enum: ['small', 'medium', 'large'],
      default: 'medium'
    },

    /* Suitability Matrix (UX Power Feature) */
    suitability: {
      apartment: { type: Boolean, default: false },
      kidsFriendly: { type: Boolean, default: false },
      firstTimeOwner: { type: Boolean, default: true },
      guardPotential: { type: Boolean, default: false }
    },

    /* Health & Vet Info */
    healthStatus: {
      vaccinated: { type: Boolean, default: false },
      dewormed: { type: Boolean, default: false },
      vetCheckedAt: { type: Date },
      notes: { type: String, default: '' }
    },

    vaccinations: { type: [String], default: [] },

    feedingGuide: {
      type: FeedingGuideSchema,
      default: () => ({})
    },

    careNotes: { type: String, default: '' },

    /* Media */
    images: { type: [String], default: [] },

    /* Availability & Ops */
    availabilityStatus: {
      type: String,
      enum: ['available', 'reserved', 'sold'],
      default: 'available'
    },

    location: { type: String, default: '' },

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
AnimalBabySchema.index({
  categoryId: 1,
  isActive: 1,
  availabilityStatus: 1,
  createdAt: -1
});

/* -----------------------------
   Compatibility Hook
------------------------------ */
AnimalBabySchema.pre('validate', function (next) {
  if (this.name && !this.nameOrTag) this.nameOrTag = this.name;
  if (!this.name && this.nameOrTag) this.name = this.nameOrTag;
  next();
});

export const AnimalBaby = mongoose.model('AnimalBaby', AnimalBabySchema);
