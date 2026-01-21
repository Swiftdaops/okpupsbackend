import { z } from 'zod';
import { Order } from '../models/Order.model.js';
import { Customer } from '../models/Customer.model.js';

const createOrderSchema = z.object({
  customerName: z.string().trim().min(2),
  customerWhatsApp: z.string().trim().min(5),
  currency: z.string().trim().min(1).optional().default('USD'),
  items: z
    .array(
      z.object({
        itemType: z.enum(['animal', 'product']),
        itemId: z.string().trim().min(1),
        name: z.string().trim().min(1),
        price: z.coerce.number().min(0),
        qty: z.coerce.number().int().min(1)
      })
    )
    .min(1)
});

export async function createOrder(req, res) {
  const parsed = createOrderSchema.safeParse(req.body || {});
  if (!parsed.success) {
    return res.status(400).json({
      message: 'Invalid order payload',
      issues: parsed.error.issues
    });
  }

  const { customerName, customerWhatsApp, currency, items } = parsed.data;

  const subtotal = items.reduce((sum, it) => sum + Number(it.price || 0) * Number(it.qty || 0), 0);

  // Find or create a Customer record using the provided phone (WhatsApp) number
  const phone = customerWhatsApp.trim();
  let customer = await Customer.findOne({ phone });
  if (!customer) {
    customer = await Customer.create({ name: customerName, phone });
  }

  const order = await Order.create({
    customerName,
    customerWhatsApp: phone,
    customer: customer._id,
    cid: customer.phone,
    currency,
    subtotal,
    items: items.map((it) => ({
      itemType: it.itemType,
      itemId: it.itemId,
      name: it.name,
      price: it.price,
      qty: it.qty
    }))
  });

  return res.status(201).json({ order });
}

export async function getOrders(req, res) {
  const orders = await Order.find().sort({ createdAt: -1 }).lean();
  return res.json({ orders });
}
