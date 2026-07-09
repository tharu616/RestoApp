const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

exports.createStripeSession = async (req, res) => {
  try {
    const { items, deliveryMethod } = req.body;

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
      success_url: `${process.env.CLIENT_URL}/customer?payment=success`,
      cancel_url: `${process.env.CLIENT_URL}/customer?payment=cancel`,
    });

    res.json({ url: session.url });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};