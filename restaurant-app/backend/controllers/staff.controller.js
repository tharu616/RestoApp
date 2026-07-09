const pool = require('../config/db');
const bcrypt = require('bcryptjs');

exports.getAll = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, phone, role, shift, created_at FROM users ORDER BY id DESC'
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { name, email, password, phone, role, shift } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Name, email, password and role are required' });
    }

    const normalizedRole = String(role).trim().toLowerCase();
    const hashed = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (name, email, password, phone, role, shift)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, name, email, phone, role, shift, created_at`,
      [name, email, hashed, phone || null, normalizedRole, shift || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { role, shift } = req.body;
    const normalizedRole = role ? String(role).trim().toLowerCase() : null;

    const result = await pool.query(
      `UPDATE users
       SET role = COALESCE($1, role),
           shift = COALESCE($2, shift)
       WHERE id = $3
       RETURNING id, name, email, phone, role, shift, created_at`,
      [normalizedRole, shift || null, req.params.id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    await pool.query('DELETE FROM users WHERE id = $1', [req.params.id]);
    res.json({ message: 'Staff removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};