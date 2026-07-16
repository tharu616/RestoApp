const pool = require('../config/db');

const boolish = (v, fallback = null) => {
  if (v === undefined) return fallback;
  if (v === null) return null;
  if (typeof v === 'boolean') return v;
  if (typeof v === 'number') return v !== 0;
  const s = String(v).trim().toLowerCase();
  if (['true', 't', '1', 'yes', 'y', 'on'].includes(s)) return true;
  if (['false', 'f', '0', 'no', 'n', 'off'].includes(s)) return false;
  return fallback;
};

const hasColumn = async (column) => {
  const { rows } = await pool.query(`
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'menu_items' AND column_name = $1 LIMIT 1
  `, [column]);
  return rows.length > 0;
};

const getMenuSelectSql = async () => {
  const cols = {
    image: await hasColumn('image'),
    is_available: await hasColumn('is_available'),
    available: await hasColumn('available'),
  };

  const imageExpr = cols.image ? 'image' : 'NULL::text AS image';
  let availExpr = 'true AS is_available';
  if (cols.is_available && cols.available) availExpr = 'COALESCE(is_available, available, true) AS is_available';
  else if (cols.is_available) availExpr = 'COALESCE(is_available, true) AS is_available';
  else if (cols.available) availExpr = 'COALESCE(available, true) AS is_available';

  return `SELECT id, name, description, price, category, ${imageExpr}, ${availExpr} FROM menu_items ORDER BY id DESC`;
};

const mapRow = (row) => ({
  id: row.id,
  name: row.name,
  description: row.description,
  price: row.price,
  category: row.category,
  image: row.image ?? null,
  image_url: row.image ? `/uploads/menu/${row.image}` : null,
  is_available: row.is_available,
  available: row.is_available,
});

exports.getAll = async (req, res) => {
  try {
    const result = await pool.query(await getMenuSelectSql());
    res.json(result.rows.map(mapRow));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { name, description, price, category } = req.body;
    const imageExists = await hasColumn('image');
    const isAvailExists = await hasColumn('is_available');
    const availExists = await hasColumn('available');
    const available = boolish(req.body.is_available ?? req.body.available, true);
    const uploadedImage = req.file ? req.file.filename : null;

    const cols = ['name', 'description', 'price', 'category'];
    const vals = [name, description || null, price, category];
    const placeholders = ['$1', '$2', '$3', '$4'];

    if (imageExists) { cols.push('image'); vals.push(uploadedImage); placeholders.push(`$${vals.length}`); }
    if (isAvailExists) { cols.push('is_available'); vals.push(available); placeholders.push(`$${vals.length}`); }
    if (availExists) { cols.push('available'); vals.push(available); placeholders.push(`$${vals.length}`); }

    const result = await pool.query(
      `INSERT INTO menu_items (${cols.join(', ')}) VALUES (${placeholders.join(', ')}) RETURNING *`,
      vals
    );

    res.status(201).json(mapRow(result.rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const imageExists = await hasColumn('image');
    const isAvailExists = await hasColumn('is_available');
    const availExists = await hasColumn('available');
    const available = boolish(req.body.is_available ?? req.body.available, null);
    const uploadedImage = req.file ? req.file.filename : null;

    const sets = [];
    const vals = [];
    const push = (sql, value) => { vals.push(value); sets.push(sql.replace('$?', `$${vals.length}`)); };

    push('name = COALESCE($?, name)', req.body.name ?? null);
    push('description = COALESCE($?, description)', req.body.description ?? null);
    push('price = COALESCE($?, price)', req.body.price ?? null);
    push('category = COALESCE($?, category)', req.body.category ?? null);
    if (imageExists) push('image = COALESCE($?, image)', uploadedImage);
    if (isAvailExists) push('is_available = COALESCE($?::boolean, is_available)', available);
    if (availExists) push('available = COALESCE($?::boolean, available)', available);

    vals.push(req.params.id);
    const result = await pool.query(
      `UPDATE menu_items SET ${sets.join(', ')} WHERE id = $${vals.length} RETURNING *`,
      vals
    );

    if (!result.rows.length) return res.status(404).json({ message: 'Menu item not found' });
    res.json(mapRow(result.rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM menu_items WHERE id = $1 RETURNING id', [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ message: 'Menu item not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};