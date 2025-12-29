import mongoose from 'mongoose';

const AnimalStatsSchema = new mongoose.Schema(
  {
    animalId: { type: mongoose.Schema.Types.ObjectId, ref: 'AnimalBaby', required: true, index: true },
    likesCount: { type: Number, default: 0 },
    orderCount: { type: Number, default: 0 }
  },
  { timestamps: true }
);

AnimalStatsSchema.index({ likesCount: -1 });
AnimalStatsSchema.index({ orderCount: -1 });

export const AnimalStats = mongoose.model('AnimalStats', AnimalStatsSchema);
