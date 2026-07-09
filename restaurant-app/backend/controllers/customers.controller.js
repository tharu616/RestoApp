const pool = require('../config/db');

const getAll = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, email, phone, created_at FROM users WHERE role = 'customer' ORDER BY id DESC"
    );
    res.json(result.rows);
  } catch { res.status(500).json({ message: 'Server error' }); }
};

const remove = async (req, res) => {
  try {
    await pool.query("DELETE FROM users WHERE id = $1 AND role = 'customer'", [req.params.id]);
    res.json({ message: 'Customer removed' });
  } catch { res.status(500).json({ message: 'Server error' }); }
};

module.exports = { getAll, remove };