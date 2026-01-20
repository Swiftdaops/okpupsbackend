import mongoose from 'mongoose';

const OrderItemSchema = new mongoose.Schema(
  {
    itemType: {
      type: String,
      enum: ['animal', 'product'],
      required: true
    },
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    qty: {
      type: Number,
      required: true,
      min: 1
    }
  },
  { _id: false }
);

const OrderSchema = new mongoose.Schema(
  {
    customerName: { type: String, required: true, trim: true },
    customerWhatsApp: { type: String, required: true, trim: true },

    currency: { type: String, default: 'USD' },
    subtotal: { type: Number, required: true, min: 0 },

    status: {
      type: String,
      enum: ['pending_payment', 'paid', 'cancelled'],
      default: 'pending_payment',
      index: true
    },

    items: {
      type: [OrderItemSchema],
      required: true,
      validate: [(v) => Array.isArray(v) && v.length > 0, 'Order requires items']
    }
  },
  { timestamps: true }
);

export const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema);
