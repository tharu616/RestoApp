const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  const result = await pool.query('SELECT * FROM customers');
  res.json(result.rows);
});

router.get('/:id', async (req, res) => {
  const result = await pool.query('SELECT * FROM customers WHERE id = $1', [req.params.id]);
  res.json(result.rows[0]);
});

router.post('/', async (req, res) => {
  const { name, email, phone } = req.body;
  const result = await pool.query(
    'INSERT INTO customers (name, email, phone) VALUES ($1, $2, $3) RETURNING *',
    [name, email, phone]
  );
  res.json(result.rows[0]);
});

router.put('/:id', async (req, res) => {
  const { name, email, phone } = req.body;
  const result = await pool.query(
    'UPDATE customers SET name=$1, email=$2, phone=$3 WHERE id=$4 RETURNING *',
    [name, email, phone, req.params.id]
  );
  res.json(result.rows[0]);
});

router.delete('/:id', async (req, res) => {
  await pool.query('DELETE FROM customers WHERE id = $1', [req.params.id]);
  res.json({ message: 'Customer deleted successfully' });
});

module.exports = router;