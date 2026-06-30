const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  const result = await pool.query('SELECT * FROM reservations');
  res.json(result.rows);
});

router.get('/:id', async (req, res) => {
  const result = await pool.query('SELECT * FROM reservations WHERE id = $1', [req.params.id]);
  res.json(result.rows[0]);
});

router.post('/', async (req, res) => {
  const { customer_name, table_number, date_time, guests } = req.body;
  const result = await pool.query(
    'INSERT INTO reservations (customer_name, table_number, date_time, guests) VALUES ($1, $2, $3, $4) RETURNING *',
    [customer_name, table_number, date_time, guests]
  );
  res.json(result.rows[0]);
});

router.put('/:id', async (req, res) => {
  const { customer_name, table_number, date_time, guests } = req.body;
  const result = await pool.query(
    'UPDATE reservations SET customer_name=$1, table_number=$2, date_time=$3, guests=$4 WHERE id=$5 RETURNING *',
    [customer_name, table_number, date_time, guests, req.params.id]
  );
  res.json(result.rows[0]);
});

router.delete('/:id', async (req, res) => {
  await pool.query('DELETE FROM reservations WHERE id = $1', [req.params.id]);
  res.json({ message: 'Reservation deleted successfully' });
});

module.exports = router;