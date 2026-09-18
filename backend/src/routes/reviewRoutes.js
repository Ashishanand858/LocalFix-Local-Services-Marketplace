const router = require('express').Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const controller = require('../controllers/reviewController');

router.post('/', protect, authorize('customer'), controller.createReview);
router.get('/provider/:providerId', controller.listProviderReviews);
router.delete('/:id', protect, authorize('customer'), controller.deleteReview);

module.exports = router;
