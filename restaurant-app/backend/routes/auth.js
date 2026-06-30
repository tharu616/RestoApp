const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { verifyToken } = require('../middleware/auth');

const generateTokens = (payload) => {
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
  return { accessToken, refreshToken };
};

// POST /api/auth/register — Customer
router.post('/register', async (req, res) => {
  const { name, email, password, phone } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const result = await pool.query(
      'INSERT INTO customers (name, email, password, phone, role) VALUES ($1,$2,$3,$4,$5) RETURNING id, name, email, role',
      [name, email, hashedPassword, phone, 'customer']
    );
    const tokens = generateTokens({ id: result.rows[0].id, role: 'customer' });
    await pool.query('UPDATE customers SET refresh_token=$1 WHERE id=$2', [tokens.refreshToken, result.rows[0].id]);
    res.status(201).json({ user: result.rows[0], accessToken: tokens.accessToken });
  } catch (err) {
    res.status(409).json({ message: 'Email already registered' });
  }
});

// POST /api/auth/register/staff — Staff
router.post('/register/staff', async (req, res) => {
  const { name, email, password, role, shift } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const result = await pool.query(
      'INSERT INTO staff (name, email, password, role, shift) VALUES ($1,$2,$3,$4,$5) RETURNING id, name, email, role',
      [name, email, hashedPassword, role, shift]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(409).json({ message: 'Email already registered' });
  }
});

// POST /api/auth/login — Unified (customer + staff + admin)
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  let user = null;
  let role = null;
  let table = null;

  const customerRes = await pool.query('SELECT * FROM customers WHERE email=$1', [email]);
  if (customerRes.rows[0]) { user = customerRes.rows[0]; role = 'customer'; table = 'customers'; }

  if (!user) {
    const staffRes = await pool.query('SELECT * FROM staff WHERE email=$1', [email]);
    if (staffRes.rows[0]) { user = staffRes.rows[0]; role = 'staff'; table = 'staff'; }
  }

  if (!user) {
    const adminRes = await pool.query('SELECT * FROM admins WHERE email=$1', [email]);
    if (adminRes.rows[0]) { user = adminRes.rows[0]; role = 'admin'; table = 'admins'; }
  }

  if (!user) return res.status(401).json({ message: 'Invalid email or password' });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).json({ message: 'Invalid email or password' });

  const tokens = generateTokens({ id: user.id, role });
  await pool.query(`UPDATE ${table} SET refresh_token=$1 WHERE id=$2`, [tokens.refreshToken, user.id]);

  res.json({ accessToken: tokens.accessToken, refreshToken: tokens.refreshToken, role });
});

// POST /api/auth/refresh
router.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(403).json({ message: 'Refresh token required' });
  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const tokens = generateTokens({ id: decoded.id, role: decoded.role });
    res.json({ accessToken: tokens.accessToken });
  } catch (err) {
    res.status(403).json({ message: 'Token invalid or expired' });
  }
});

// POST /api/auth/logout
router.post('/logout', async (req, res) => {
  const { refreshToken } = req.body;
  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const table = decoded.role === 'customer' ? 'customers' : decoded.role === 'staff' ? 'staff' : 'admins';
    await pool.query(`UPDATE ${table} SET refresh_token=NULL WHERE id=$1`, [decoded.id]);
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    res.status(403).json({ message: 'Token invalid or expired' });
  }
});

// GET /api/auth/me
router.get('/me', verifyToken, async (req, res) => {
  const { id, role } = req.user;
  const table = role === 'customer' ? 'customers' : role === 'staff' ? 'staff' : 'admins';
  const result = await pool.query(`SELECT id, name, email, role FROM ${table} WHERE id=$1`, [id]);
  res.json(result.rows[0]);
});

module.exports = router;