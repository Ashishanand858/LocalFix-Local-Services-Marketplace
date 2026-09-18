const router = require('express').Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const controller = require('../controllers/paymentController');

router.post('/create-order', protect, authorize('customer'), controller.createOrder);
router.post('/verify', protect, authorize('customer'), controller.verifyPayment);
router.post('/webhook', controller.webhook);
router.get('/:bookingId', protect, authorize('customer'), controller.getPayment);

module.exports = router;
