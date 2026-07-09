const router = require('express').Router();
const auth = require('../middleware/authenticateToken');
const role = require('../middleware/authorizeRole');
const { createStripeSession } = require('../controllers/payment.controller');

router.post('/stripe/create-checkout-session', auth, role('customer'), createStripeSession);

module.exports = router;