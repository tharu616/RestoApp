const express = require('express');
const router = express.Router();
const pool = require('../db');
const { verifyAdmin } = require('../middleware/auth');

// GET all menu items
router.get('/', async (req, res) => {
  try {
    const { category, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    let query = 'SELECT * FROM menu_items WHERE 1=1';
    const params = [];
    if (category) { params.push(category); query += ` AND category=$${params.length}`; }
    params.push(limit, offset);
    query += ` LIMIT $${params.length - 1} OFFSET $${params.length}`;
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single menu item
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM menu_items WHERE id=$1', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ message: 'Item not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create menu item — Admin only
router.post('/', verifyAdmin, async (req, res) => {
  try {
    const { name, description, price, category, image_url, is_available } = req.body;
    const result = await pool.query(
      'INSERT INTO menu_items (name, description, price, category, image_url, is_available) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
      [name, description, price, category, image_url, is_available ?? true]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH update menu item — Admin only
router.patch('/:id', verifyAdmin, async (req, res) => {
  try {
    const { name, description, price, category, image_url, is_available } = req.body;
    const result = await pool.query(
      'UPDATE menu_items SET name=COALESCE($1,name), description=COALESCE($2,description), price=COALESCE($3,price), category=COALESCE($4,category), image_url=COALESCE($5,image_url), is_available=COALESCE($6,is_available) WHERE id=$7 RETURNING *',
      [name, description, price, category, image_url, is_available, req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ message: 'Item not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE menu item — Admin only
router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM menu_items WHERE id=$1', [req.params.id]);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;