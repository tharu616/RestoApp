const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  const result = await pool.query('SELECT * FROM orders');
  res.json(result.rows);
});

router.get('/:id', async (req, res) => {
  const result = await pool.query('SELECT * FROM orders WHERE id = $1', [req.params.id]);
  res.json(result.rows[0]);
});

router.post('/', async (req, res) => {
  const { customer_name, total_amount, status } = req.body;
  const result = await pool.query(
    'INSERT INTO orders (customer_name, total_amount, status) VALUES ($1, $2, $3) RETURNING *',
    [customer_name, total_amount, status]
  );
  res.json(result.rows[0]);
});

router.put('/:id', async (req, res) => {
  const { customer_name, total_amount, status } = req.body;
  const result = await pool.query(
    'UPDATE orders SET customer_name=$1, total_amount=$2, status=$3 WHERE id=$4 RETURNING *',
    [customer_name, total_amount, status, req.params.id]
  );
  res.json(result.rows[0]);
});

router.delete('/:id', async (req, res) => {
  await pool.query('DELETE FROM orders WHERE id = $1', [req.params.id]);
  res.json({ message: 'Order deleted successfully' });
});

module.exports = router;