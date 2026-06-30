const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET all menu items
router.get('/', async (req, res) => {
  const result = await pool.query('SELECT * FROM menu_items');
  res.json(result.rows);
});

// GET single menu item
router.get('/:id', async (req, res) => {
  const result = await pool.query('SELECT * FROM menu_items WHERE id = $1', [req.params.id]);
  res.json(result.rows[0]);
});

// POST create menu item
router.post('/', async (req, res) => {
  const { name, price, category, available } = req.body;
  const result = await pool.query(
    'INSERT INTO menu_items (name, price, category, available) VALUES ($1, $2, $3, $4) RETURNING *',
    [name, price, category, available]
  );
  res.json(result.rows[0]);
});

// PUT update menu item
router.put('/:id', async (req, res) => {
  const { name, price, category, available } = req.body;
  const result = await pool.query(
    'UPDATE menu_items SET name=$1, price=$2, category=$3, available=$4 WHERE id=$5 RETURNING *',
    [name, price, category, available, req.params.id]
  );
  res.json(result.rows[0]);
});

// DELETE menu item
router.delete('/:id', async (req, res) => {
  await pool.query('DELETE FROM menu_items WHERE id = $1', [req.params.id]);
  res.json({ message: 'Menu item deleted successfully' });
});

module.exports = router;