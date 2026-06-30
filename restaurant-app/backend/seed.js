const pool = require('./config/db');
const bcrypt = require('bcryptjs');

async function seedAdmin() {
  const email = 'admin@restopro.com';
  const password = 'Admin@1234';
  const role = 'admin';
  const name = 'Super Admin';

  const existing = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  if (existing.rows.length > 0) {
    console.log('✅ Admin already exists. Skipping seed.');
    process.exit();
  }

  const hashed = await bcrypt.hash(password, 10);
  await pool.query(
    'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)',
    [name, email, hashed, role]
  );
  console.log('✅ Admin seeded successfully!');
  console.log('   Email:', email);
  console.log('   Password:', password);
  process.exit();
}

seedAdmin().catch((err) => { console.error(err); process.exit(1); });