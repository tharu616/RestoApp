require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/menu', require('./routes/menu.routes'));
app.use('/api/orders', require('./routes/orders.routes'));
app.use('/api/reservations', require('./routes/reservations.routes'));
app.use('/api/staff', require('./routes/staff.routes'));
app.use('/api/customers', require('./routes/customers.routes'));
app.use('/api/tables', require('./routes/tables.routes'));
app.use('/api/payments', require('./routes/payment.routes'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: '✅ RestoPro API is running' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running → http://localhost:${PORT}`);
});