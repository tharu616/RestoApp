const router = require('express').Router();
const auth = require('../middleware/authenticateToken');
const role = require('../middleware/authorizeRole');
const ctrl = require('../controllers/menu.controller');

router.get('/', ctrl.getAll);
router.post('/', auth, role('staff', 'admin'), ctrl.create);
router.patch('/:id', auth, role('staff', 'admin'), ctrl.update);
router.put('/:id', auth, role('staff', 'admin'), ctrl.update);
router.delete('/:id', auth, role('staff', 'admin'), ctrl.remove);

module.exports = router;