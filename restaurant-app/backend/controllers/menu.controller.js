const pool = require('../config/db');

const getAll = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM menu_items ORDER BY id DESC');
    res.json(result.rows);
  } catch { res.status(500).json({ message: 'Server error' }); }
};

const create = async (req, res) => {
  const { name, description, price, category, is_available, image_url } = req.body;
  if (!name || !price) return res.status(400).json({ message: 'Name and price required' });
  try {
    const result = await pool.query(
      'INSERT INTO menu_items (name, description, price, category, is_available, image_url) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
      [name, description || null, price, category || null, is_available ?? true, image_url || null]
    );
    res.status(201).json(result.rows[0]);
  } catch { res.status(500).json({ message: 'Server error' }); }
};

const update = async (req, res) => {
  const { id } = req.params;
  const { name, description, price, category, is_available } = req.body;
  try {
    const result = await pool.query(
      'UPDATE menu_items SET name=COALESCE($1,name), description=COALESCE($2,description), price=COALESCE($3,price), category=COALESCE($4,category), is_available=COALESCE($5,is_available) WHERE id=$6 RETURNING *',
      [name, description, price, category, is_available, id]
    );
    res.json(result.rows[0]);
  } catch { res.status(500).json({ message: 'Server error' }); }
};

const remove = async (req, res) => {
  try {
    await pool.query('DELETE FROM menu_items WHERE id = $1', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch { res.status(500).json({ message: 'Server error' }); }
};

module.exports = { getAll, create, update, remove };