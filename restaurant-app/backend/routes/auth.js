const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ── CUSTOMER REGISTER ──
router.post('/customer/register', async (req, res) => {
  const { name, email, phone, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const result = await pool.query(
      'INSERT INTO customers (name, email, phone, password, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role',
      [name, email, phone, hashedPassword, 'customer']
    );
    res.json({ message: 'Customer registered successfully', user: result.rows[0] });
  } catch (err) {
    res.status(400).json({ message: 'Email already exists' });
  }
});

// ── CUSTOMER LOGIN ──
router.post('/customer/login', async (req, res) => {
  const { email, password } = req.body;
  const result = await pool.query('SELECT * FROM customers WHERE email = $1', [email]);
  const user = result.rows[0];
  if (!user) return res.status(404).json({ message: 'User not found' });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).json({ message: 'Incorrect password' });

  const token = jwt.sign({ id: user.id, role: 'customer' }, process.env.JWT_SECRET, { expiresIn: '1d' });
  res.json({ message: 'Login successful', token, user: { id: user.id, name: user.name, role: 'customer' } });
});

// ── STAFF REGISTER ──
router.post('/staff/register', async (req, res) => {
  const { name, email, role, shift, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const result = await pool.query(
      'INSERT INTO staff (name, email, role, shift, password) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role',
      [name, email, role, shift, hashedPassword]
    );
    res.json({ message: 'Staff registered successfully', user: result.rows[0] });
  } catch (err) {
    res.status(400).json({ message: 'Email already exists' });
  }
});

// ── STAFF LOGIN ──
router.post('/staff/login', async (req, res) => {
  const { email, password } = req.body;
  const result = await pool.query('SELECT * FROM staff WHERE email = $1', [email]);
  const user = result.rows[0];
  if (!user) return res.status(404).json({ message: 'Staff not found' });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).json({ message: 'Incorrect password' });

  const token = jwt.sign({ id: user.id, role: 'staff' }, process.env.JWT_SECRET, { expiresIn: '1d' });
  res.json({ message: 'Login successful', token, user: { id: user.id, name: user.name, role: 'staff' } });
});

// ── ADMIN REGISTER ──
router.post('/admin/register', async (req, res) => {
  const { name, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const result = await pool.query(
      'INSERT INTO admins (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
      [name, email, hashedPassword, 'admin']
    );
    res.json({ message: 'Admin registered successfully', user: result.rows[0] });
  } catch (err) {
    res.status(400).json({ message: 'Email already exists' });
  }
});

// ── ADMIN LOGIN ──
router.post('/admin/login', async (req, res) => {
  const { email, password } = req.body;
  const result = await pool.query('SELECT * FROM admins WHERE email = $1', [email]);
  const user = result.rows[0];
  if (!user) return res.status(404).json({ message: 'Admin not found' });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).json({ message: 'Incorrect password' });

  const token = jwt.sign({ id: user.id, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1d' });
  res.json({ message: 'Login successful', token, user: { id: user.id, name: user.name, role: 'admin' } });
});

module.exports = router;