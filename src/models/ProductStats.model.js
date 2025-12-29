import mongoose from 'mongoose';

const ProductStatsSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    likesCount: { type: Number, default: 0 },
    orderCount: { type: Number, default: 0 }
  },
  { timestamps: true }
);

ProductStatsSchema.index({ likesCount: -1 });
ProductStatsSchema.index({ orderCount: -1 });

export const ProductStats = mongoose.model('ProductStats', ProductStatsSchema);
