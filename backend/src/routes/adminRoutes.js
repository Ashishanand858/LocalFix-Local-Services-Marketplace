const router = require('express').Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const controller = require('../controllers/adminController');

router.use(protect, authorize('admin'));
router.get('/dashboard', controller.dashboard);
router.get('/users', controller.listUsers);
router.put('/users/:id/toggle', controller.toggleUser);

module.exports = router;
