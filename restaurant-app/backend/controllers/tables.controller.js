const pool = require('../config/db');

const getAll = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tables ORDER BY number ASC');
    res.json(result.rows);
  } catch { res.status(500).json({ message: 'Server error' }); }
};

const create = async (req, res) => {
  const { number, capacity } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO tables (number, capacity) VALUES ($1,$2) RETURNING *', [number, capacity]
    );
    res.status(201).json(result.rows[0]);
  } catch { res.status(500).json({ message: 'Server error' }); }
};

const update = async (req, res) => {
  const { status, capacity } = req.body;
  try {
    const result = await pool.query(
      'UPDATE tables SET status=COALESCE($1,status), capacity=COALESCE($2,capacity) WHERE id=$3 RETURNING *',
      [status, capacity, req.params.id]
    );
    res.json(result.rows[0]);
  } catch { res.status(500).json({ message: 'Server error' }); }
};

const remove = async (req, res) => {
  try {
    await pool.query('DELETE FROM tables WHERE id = $1', [req.params.id]);
    res.json({ message: 'Table removed' });
  } catch { res.status(500).json({ message: 'Server error' }); }
};

module.exports = { getAll, create, update, remove };