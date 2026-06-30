const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  const result = await pool.query('SELECT * FROM staff');
  res.json(result.rows);
});

router.get('/:id', async (req, res) => {
  const result = await pool.query('SELECT * FROM staff WHERE id = $1', [req.params.id]);
  res.json(result.rows[0]);
});

router.post('/', async (req, res) => {
  const { name, role, shift } = req.body;
  const result = await pool.query(
    'INSERT INTO staff (name, role, shift) VALUES ($1, $2, $3) RETURNING *',
    [name, role, shift]
  );
  res.json(result.rows[0]);
});

router.put('/:id', async (req, res) => {
  const { name, role, shift } = req.body;
  const result = await pool.query(
    'UPDATE staff SET name=$1, role=$2, shift=$3 WHERE id=$4 RETURNING *',
    [name, role, shift, req.params.id]
  );
  res.json(result.rows[0]);
});

router.delete('/:id', async (req, res) => {
  await pool.query('DELETE FROM staff WHERE id = $1', [req.params.id]);
  res.json({ message: 'Staff deleted successfully' });
});

module.exports = router;