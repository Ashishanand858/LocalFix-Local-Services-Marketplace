const router = require('express').Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const controller = require('../controllers/bookingController');

router.post('/', protect, authorize('customer'), controller.createBooking);
router.get('/my', protect, controller.myBookings);
router.get('/admin/all', protect, authorize('admin'), controller.adminListBookings);
router.get('/:id', protect, controller.getBooking);
router.put('/:id/status', protect, authorize('customer', 'provider'), controller.updateStatus);

module.exports = router;
