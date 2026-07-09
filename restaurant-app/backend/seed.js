require('dotenv').config();
const pool   = require('./config/db');
const bcrypt = require('bcryptjs');

async function seedAdmin() {
  const email    = 'admin@restopro.com';
  const password = 'Admin@1234';
  const name     = 'Super Admin';
  const role     = 'admin';

  try {
    // Wait for connection
    await new Promise(resolve => setTimeout(resolve, 500));

    const existing = await pool.query(
      'SELECT id FROM users WHERE email = $1', [email]
    );

    if (existing.rows.length > 0) {
      console.log('✅ Admin already exists — skipping.');
      process.exit(0);
    }

    const hashed = await bcrypt.hash(password, 10);

    await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)',
      [name, email, hashed, role]
    );

    console.log('');
    console.log('✅ Admin seeded successfully!');
    console.log('   Email:   ', email);
    console.log('   Password:', password);
    console.log('');
    process.exit(0);

  } catch (err) {
    console.error('❌ Seed error:', err.message);
    process.exit(1);
  }
}

seedAdmin();