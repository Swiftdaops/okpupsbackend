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

  // Normalize phone to digits-only so we can reliably identify returning customers
  const rawPhone = String(customerWhatsApp || "").trim();
  const phone = rawPhone.replace(/[^0-9]/g, "");

  // Find existing customer by normalized phone
  let customer = await Customer.findOne({ phone });

  if (!customer) {
    // Create new customer record
    customer = await Customer.create({ name: customerName, phone, orderCount: 1, lastOrderAt: new Date() });
  } else {
    // Merge/update customer data: update name if the new name is longer/more complete
    const updates = { $inc: { orderCount: 1 }, $set: { lastOrderAt: new Date() } };
    if (customerName && customerName.length > (customer.name || "").length && customerName !== customer.name) {
      updates.$set.name = customerName;
    }
    customer = await Customer.findByIdAndUpdate(customer._id, updates, { new: true });
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
