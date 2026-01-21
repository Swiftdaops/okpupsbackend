import mongoose from 'mongoose';

const CustomerSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    phone: { type: String, required: true, unique: true, trim: true, index: true },
    createdAt: { type: Date, default: Date.now }
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

CustomerSchema.virtual('cid').get(function () {
  return this.phone;
});

export const Customer = mongoose.models.Customer || mongoose.model('Customer', CustomerSchema);
