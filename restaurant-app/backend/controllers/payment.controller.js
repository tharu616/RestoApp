const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const pool = require('../config/db');

exports.createStripeSession = async (req, res) => {
  try {
    const { items, deliveryMethod, orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({ message: 'orderId is required' });
    }

    const line_items = (items || []).map((item) => ({
      price_data: {
        currency: 'lkr',
        product_data: { name: item.name },
        unit_amount: Math.round(Number(item.price) * 100),
      },
      quantity: Number(item.qty) || 1,
    }));

    if (deliveryMethod === 'delivery') {
      line_items.push({
        price_data: {
          currency: 'lkr',
          product_data: { name: 'Delivery fee' },
          unit_amount: 20000,
        },
        quantity: 1,
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items,
      client_reference_id: String(orderId),
      metadata: { orderId: String(orderId) },
      success_url: `${process.env.CLIENT_URL}/customer?payment=success&order=${orderId}`,
      cancel_url: `${process.env.CLIENT_URL}/customer?payment=cancel&order=${orderId}`,
    });

    res.json({ url: session.url, sessionId: session.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.confirmPayment = async (req, res) => {
  const { orderId, sessionId } = req.body;
  if (!orderId) return res.status(400).json({ message: 'orderId required' });

  try {
    if (sessionId) {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      if (session.payment_status !== 'paid') {
        return res.status(400).json({ message: 'Payment not completed' });
      }
    }

    const result = await pool.query(
      `UPDATE orders SET payment_status = 'paid' WHERE id = $1 RETURNING *`,
      [orderId]
    );

    if (!result.rows.length) return res.status(404).json({ message: 'Order not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};