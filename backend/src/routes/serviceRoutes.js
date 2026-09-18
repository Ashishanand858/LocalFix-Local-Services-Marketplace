const router = require('express').Router();
const controller = require('../controllers/serviceController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', controller.listServices);
router.get('/:id', controller.getService);
router.post('/', protect, authorize('admin'), controller.createService);
router.put('/:id', protect, authorize('admin'), controller.updateService);
router.delete('/:id', protect, authorize('admin'), controller.deleteService);

module.exports = router;
