const express = require('express');
const router = express.Router();
const auth = require('../middleware/authenticateToken');
const role = require('../middleware/authorizeRole');
const ctrl = require('../controllers/orders.controller');

router.get('/',              auth, ctrl.getAll);
router.post('/',             auth, ctrl.create);
router.patch('/:id/status',  auth, role('admin', 'staff'), ctrl.updateStatus);
router.delete('/:id',        auth, role('admin'), ctrl.remove);

module.exports = router;