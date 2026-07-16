const router = require('express').Router();
const auth = require('../middleware/authenticateToken');
const role = require('../middleware/authorizeRole');
const { createStripeSession, confirmPayment } = require('../controllers/payment.controller');

router.post('/stripe/create-checkout-session', auth, role('customer'), createStripeSession);
router.post('/stripe/confirm', auth, role('customer'), confirmPayment);

module.exports = router;