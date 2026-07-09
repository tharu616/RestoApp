const express = require('express');
const router = express.Router();
const auth = require('../middleware/authenticateToken');
const role = require('../middleware/authorizeRole');
const ctrl = require('../controllers/tables.controller');

router.get('/',       ctrl.getAll);
router.post('/',      auth, role('admin'), ctrl.create);
router.patch('/:id',  auth, role('admin'), ctrl.update);
router.delete('/:id', auth, role('admin'), ctrl.remove);

module.exports = router;