const express = require('express');
const router = express.Router();
const pool = require('../db');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

// POST /api/reservations
router.post('/', verifyToken, async (req, res) => {
  const { customer_id, table_id, date_time, time_slot, guests, notes } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO reservations (customer_name, table_id, date_time, time_slot, guests, notes, status) VALUES ((SELECT name FROM customers WHERE id=$1), $2, $3, $4, $5, $6, $7) RETURNING *',
      [customer_id, table_id, date_time, time_slot, guests, notes, 'CONFIRMED']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ message: 'Table already booked for that date + time slot' });
    res.status(500).json({ message: err.message });
  }
});

// GET /api/reservations
router.get('/', verifyToken, async (req, res) => {
  const { date, status, page = 1 } = req.query;
  const offset = (page - 1) * 10;
  let query = 'SELECT * FROM reservations WHERE 1=1';
  const params = [];
  if (status) { params.push(status); query += ` AND status=$${params.length}`; }
  if (date) { params.push(date); query += ` AND DATE(date_time)=$${params.length}`; }
  params.push(10, offset);
  query += ` LIMIT $${params.length - 1} OFFSET $${params.length}`;
  const result = await pool.query(query, params);
  res.json(result.rows);
});

// GET /api/reservations/:id
router.get('/:id', verifyToken, async (req, res) => {
  const result = await pool.query('SELECT * FROM reservations WHERE id=$1', [req.params.id]);
  if (!result.rows[0]) return res.status(404).json({ message: 'Reservation not found' });
  res.json(result.rows[0]);
});

// PATCH /api/reservations/:id
router.patch('/:id', verifyToken, async (req, res) => {
  const { date_time, time_slot, guests } = req.body;
  try {
    const result = await pool.query(
      'UPDATE reservations SET date_time=COALESCE($1,date_time), time_slot=COALESCE($2,time_slot), guests=COALESCE($3,guests) WHERE id=$4 RETURNING *',
      [date_time, time_slot, guests, req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ message: 'Reservation not found' });
    res.json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ message: 'Table already booked for that date + time slot' });
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/reservations/:id — Cancel
router.delete('/:id', verifyToken, async (req, res) => {
  const reservation = await pool.query('SELECT * FROM reservations WHERE id=$1', [req.params.id]);
  if (!reservation.rows[0]) return res.status(404).json({ message: 'Reservation not found' });
  await pool.query('UPDATE reservations SET status=$1 WHERE id=$2', ['CANCELLED', req.params.id]);
  res.json({ status: 'CANCELLED' });
});

module.exports = router;