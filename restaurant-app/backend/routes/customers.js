const express = require('express');
const router = express.Router();
const pool = require('../db');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

// GET /api/customers — Admin only
router.get('/', verifyAdmin, async (req, res) => {
  const { page = 1 } = req.query;
  const offset = (page - 1) * 10;
  const result = await pool.query('SELECT id, name, email, phone, address, role FROM customers LIMIT 10 OFFSET $1', [offset]);
  res.json(result.rows);
});

// GET /api/customers/:id
router.get('/:id', verifyToken, async (req, res) => {
  const result = await pool.query('SELECT id, name, email, phone, address, role FROM customers WHERE id=$1', [req.params.id]);
  if (!result.rows[0]) return res.status(404).json({ message: 'Customer not found' });
  const orders = await pool.query('SELECT * FROM orders WHERE customer_id=$1', [req.params.id]);
  res.json({ ...result.rows[0], order_history: orders.rows });
});

// PATCH /api/customers/:id
router.patch('/:id', verifyToken, async (req, res) => {
  const { name, phone, email, address } = req.body;
  const result = await pool.query(
    'UPDATE customers SET name=COALESCE($1,name), phone=COALESCE($2,phone), email=COALESCE($3,email), address=COALESCE($4,address) WHERE id=$5 RETURNING id, name, email, phone, address',
    [name, phone, email, address, req.params.id]
  );
  if (!result.rows[0]) return res.status(404).json({ message: 'Customer not found' });
  res.json(result.rows[0]);
});

// DELETE /api/customers/:id
router.delete('/:id', verifyAdmin, async (req, res) => {
  const activeOrders = await pool.query(
    "SELECT id FROM orders WHERE customer_id=$1 AND status NOT IN ('COMPLETED','CANCELLED')",
    [req.params.id]
  );
  if (activeOrders.rows.length > 0) return res.status(409).json({ message: 'Cannot delete — active orders exist' });
  await pool.query('DELETE FROM customers WHERE id=$1', [req.params.id]);
  res.status(204).send();
});

module.exports = router;