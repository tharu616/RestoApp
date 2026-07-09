const express = require('express');
const router = express.Router();
const auth = require('../middleware/authenticateToken');
const role = require('../middleware/authorizeRole');
const ctrl = require('../controllers/staff.controller');

router.get('/', auth, role('admin'), ctrl.getAll);
router.post('/', auth, role('admin'), ctrl.create);
router.patch('/:id', auth, role('admin'), ctrl.update);
router.delete('/:id', auth, role('admin'), ctrl.remove);

module.exports = router;