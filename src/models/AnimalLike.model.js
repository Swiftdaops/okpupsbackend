import mongoose from 'mongoose';

const AnimalLikeSchema = new mongoose.Schema(
  {
    animalId: { type: mongoose.Schema.Types.ObjectId, ref: 'AnimalBaby', required: true, index: true },
    clientId: { type: String, required: true, index: true }
  },
  { timestamps: true }
);

AnimalLikeSchema.index({ animalId: 1, clientId: 1 }, { unique: true });

export const AnimalLike = mongoose.model('AnimalLike', AnimalLikeSchema);
