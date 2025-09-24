import { z } from 'zod';
import crypto from 'crypto';
import { razorpay } from '../lib/razorpay.js';
import { supabase } from '../lib/supabase.js';
const CreateOrderSchema = z.object({
    items: z.array(z.object({
        id: z.string(),
        title: z.string(),
        artist: z.string(),
        image: z.string().optional().nullable(),
        price: z.number().positive(),
        quantity: z.number().int().positive()
    })),
    currency: z.literal('INR'),
    email: z.string().email().optional(),
    userId: z.string().optional()
});
export async function createOrder(req, res) {
    const parsed = CreateOrderSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid payload', details: parsed.error.flatten() });
    }
    // attach from auth middleware if present
    // @ts-ignore
    const authed = req.user;
    const { items, currency, email, userId } = parsed.data;
    // Calculate total in paise (1 INR = 100 paise)
    const amountInPaise = Math.round(items.reduce((sum, i) => sum + i.price * i.quantity, 0) * 100);
    if (amountInPaise <= 0) {
        return res.status(400).json({ error: 'Amount must be greater than zero' });
    }
    try {
        const rzpOrder = await razorpay.orders.create({
            amount: amountInPaise,
            currency,
            payment_capture: true
        });
        const { data: orderRow, error } = await supabase
            .from('orders')
            .insert({
            user_id: (authed?.id ?? userId) ?? null,
            email: (authed?.email ?? email) ?? null,
            status: 'created',
            amount: amountInPaise,
            currency,
            razorpay_order_id: rzpOrder.id
        })
            .select()
            .single();
        if (error) {
            return res.status(500).json({ error: 'Failed to save order', details: error.message });
        }
        // store items
        const orderItems = items.map((i) => ({
            order_id: orderRow.id,
            product_id: i.id,
            title: i.title,
            artist: i.artist,
            image: i.image ?? null,
            unit_price_inr: i.price * 100, // Store price in paise (1 INR = 100 paise)
            quantity: i.quantity
        }));
        const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
        if (itemsError) {
            return res.status(500).json({ error: 'Failed to save order items', details: itemsError.message });
        }
        return res.json({ order: orderRow, razorpayOrder: rzpOrder, amount: amountInPaise, currency });
    }
    catch (e) {
        return res.status(500).json({ error: 'Razorpay order creation failed', details: e.message });
    }
}
const VerifySchema = z.object({
    razorpay_order_id: z.string(),
    razorpay_payment_id: z.string(),
    razorpay_signature: z.string()
});
export async function verifyPayment(req, res) {
    const parsed = VerifySchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid payload', details: parsed.error.flatten() });
    }
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = parsed.data;
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body)
        .digest('hex');
    const isValid = expectedSignature === razorpay_signature;
    if (!isValid) {
        return res.status(400).json({ error: 'Invalid signature' });
    }
    const { data, error } = await supabase
        .from('orders')
        .update({ status: 'paid', razorpay_payment_id, razorpay_signature })
        .eq('razorpay_order_id', razorpay_order_id)
        .select()
        .single();
    if (error) {
        return res.status(500).json({ error: 'Failed to update order', details: error.message });
    }
    return res.json({ order: data });
}
export async function getOrderById(req, res) {
    const id = req.params.id;
    const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('id', id)
        .single();
    if (error) {
        return res.status(404).json({ error: 'Order not found' });
    }
    return res.json({ order: data });
}
export async function webhook(req, res) {
    // Optional: validate webhook signature header 'x-razorpay-signature' if configured
    // For simplicity, rely on client verification flow above.
    res.json({ ok: true });
}
