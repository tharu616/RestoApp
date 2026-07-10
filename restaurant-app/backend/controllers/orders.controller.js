const pool = require('../config/db');

const getAll = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT o.*, u.name as customer_name
      FROM orders o
      LEFT JOIN users u ON o.customer_id = u.id
      ORDER BY o.id DESC
    `);
    res.json(result.rows);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

const create = async (req, res) => {
  const {
    customer_id,
    table_id,
    waiter_id,
    items,
    deliveryMethod,
    address,
    phone,
    paymentMethod,
    total_price,
  } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ message: 'Order items required' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    let total = 0;
    for (const item of items) {
      const menu = await client.query('SELECT price FROM menu_items WHERE id = $1', [item.menu_item_id]);
      if (menu.rows.length > 0) total += Number(menu.rows[0].price) * Number(item.quantity);
    }

    const finalTotal = Number(total_price) || total;
    const method = paymentMethod || 'card';
    const delivery = deliveryMethod || 'delivery';

    const orderRes = await client.query(
      `INSERT INTO orders (
        customer_id,
        table_id,
        waiter_id,
        total_price,
        delivery_method,
        address,
        phone,
        payment_method,
        payment_status
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [
        customer_id || req.user.id,
        table_id || null,
        waiter_id || null,
        finalTotal,
        delivery,
        address || null,
        phone || null,
        method,
        method === 'cash' ? 'pending' : 'paid',
      ]
    );

    const order = orderRes.rows[0];

    for (const item of items) {
      const menu = await client.query('SELECT price FROM menu_items WHERE id = $1', [item.menu_item_id]);
      await client.query(
        'INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price) VALUES ($1,$2,$3,$4)',
        [order.id, item.menu_item_id, item.quantity, menu.rows[0]?.price || 0]
      );
    }

    await client.query('COMMIT');
    res.status(201).json(order);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  } finally {
    client.release();
  }
};

const updateStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const allowed = ['PENDING', 'PREPARING', 'READY', 'SERVED', 'COMPLETED', 'CANCELLED'];
  if (!allowed.includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }
  try {
    const result = await pool.query(
      'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );
    res.json(result.rows[0]);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

const remove = async (req, res) => {
  try {
    await pool.query('DELETE FROM orders WHERE id = $1', [req.params.id]);
    res.json({ message: 'Order removed' });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getAll, create, updateStatus, remove };