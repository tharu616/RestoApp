const express = require('express');
const router = express.Router();
const auth = require('../middleware/authenticateToken');
const role = require('../middleware/authorizeRole');
const ctrl = require('../controllers/customers.controller');

router.get('/',       auth, role('admin'), ctrl.getAll);
router.delete('/:id', auth, role('admin'), ctrl.remove);

module.exports = router;