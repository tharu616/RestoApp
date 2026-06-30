const express = require('express');
const router = express.Router();
const pool = require('../db');
const { verifyAdmin } = require('../middleware/auth');

// POST /api/staff
router.post('/', verifyAdmin, async (req, res) => {
  const { name, email, password, role, shift, phone } = req.body;
  const bcrypt = require('bcryptjs');
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const result = await pool.query(
      'INSERT INTO staff (name, email, password, role, shift) VALUES ($1,$2,$3,$4,$5) RETURNING id, name, email, role, shift',
      [name, email, hashedPassword, role, shift]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(409).json({ message: 'Email already exists' });
  }
});

// GET /api/staff
router.get('/', verifyAdmin, async (req, res) => {
  const { role, shift } = req.query;
  let query = 'SELECT id, name, email, role, shift FROM staff WHERE 1=1';
  const params = [];
  if (role) { params.push(role); query += ` AND role=$${params.length}`; }
  if (shift) { params.push(shift); query += ` AND shift=$${params.length}`; }
  const result = await pool.query(query, params);
  res.json(result.rows);
});

// GET /api/staff/:id
router.get('/:id', verifyAdmin, async (req, res) => {
  const result = await pool.query('SELECT id, name, email, role, shift FROM staff WHERE id=$1', [req.params.id]);
  if (!result.rows[0]) return res.status(404).json({ message: 'Staff member not found' });
  res.json(result.rows[0]);
});

// PATCH /api/staff/:id
router.patch('/:id', verifyAdmin, async (req, res) => {
  const { role, shift, phone } = req.body;
  const result = await pool.query(
    'UPDATE staff SET role=COALESCE($1,role), shift=COALESCE($2,shift) WHERE id=$3 RETURNING id, name, email, role, shift',
    [role, shift, req.params.id]
  );
  if (!result.rows[0]) return res.status(404).json({ message: 'Staff member not found' });
  res.json(result.rows[0]);
});

// DELETE /api/staff/:id
router.delete('/:id', verifyAdmin, async (req, res) => {
  const result = await pool.query('SELECT id FROM staff WHERE id=$1', [req.params.id]);
  if (!result.rows[0]) return res.status(404).json({ message: 'Staff member not found' });
  await pool.query('DELETE FROM staff WHERE id=$1', [req.params.id]);
  res.status(204).send();
});

module.exports = router;