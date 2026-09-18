const router = require('express').Router();
const { protect } = require('../middleware/authMiddleware');
const controller = require('../controllers/notificationController');

router.get('/', protect, controller.listNotifications);
router.put('/:id/read', protect, controller.markRead);
router.put('/read-all', protect, controller.markAllRead);

module.exports = router;
