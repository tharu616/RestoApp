const pool = require('../config/db');

const getAll = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT r.*, u.name as customer_name, t.number as table_number
      FROM reservations r
      LEFT JOIN users u ON r.customer_id = u.id
      LEFT JOIN tables t ON r.table_id = t.id
      ORDER BY r.id DESC
    `);
    res.json(result.rows);
  } catch { res.status(500).json({ message: 'Server error' }); }
};

const create = async (req, res) => {
  const { table_id, date_time, time_slot, guests, notes } = req.body;
  const customer_id = req.user.id;
  if (!table_id || !guests)
    return res.status(400).json({ message: 'Table and guests required' });
  try {
    const result = await pool.query(
      'INSERT INTO reservations (customer_id, table_id, date_time, time_slot, guests, notes) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
      [customer_id, table_id, date_time || null, time_slot || null, guests, notes || null]
    );
    res.status(201).json(result.rows[0]);
  } catch { res.status(500).json({ message: 'Server error' }); }
};

const update = async (req, res) => {
  const { id } = req.params;
  const { date_time, time_slot, guests, status, notes } = req.body;
  try {
    const result = await pool.query(
      'UPDATE reservations SET date_time=COALESCE($1,date_time), time_slot=COALESCE($2,time_slot), guests=COALESCE($3,guests), status=COALESCE($4,status), notes=COALESCE($5,notes) WHERE id=$6 RETURNING *',
      [date_time, time_slot, guests, status, notes, id]
    );
    res.json(result.rows[0]);
  } catch { res.status(500).json({ message: 'Server error' }); }
};

const remove = async (req, res) => {
  try {
    await pool.query('DELETE FROM reservations WHERE id = $1', [req.params.id]);
    res.json({ message: 'Reservation cancelled' });
  } catch { res.status(500).json({ message: 'Server error' }); }
};

module.exports = { getAll, create, update, remove };