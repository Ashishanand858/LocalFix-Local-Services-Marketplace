const router = require('express').Router();
const controller = require('../controllers/providerController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/', controller.listProviders);
router.get('/all', protect, authorize('admin'), controller.listAllProviders);
router.get('/profile/me', protect, authorize('provider'), controller.getMyProfile);
router.get('/:id', controller.getProvider);
router.post('/profile', protect, authorize('provider'), upload.single('profileImage'), controller.upsertProfile);
router.put('/profile', protect, authorize('provider'), upload.single('profileImage'), controller.upsertProfile);
router.put('/:id/verify', protect, authorize('admin'), controller.verifyProvider);

module.exports = router;
