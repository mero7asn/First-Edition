const express = require('express');
const router = express.Router();
const { validateCoupon, getAllCoupons, createCoupon, updateCoupon, deleteCoupon } = require('../controllers/couponController');
const { protect, authorize } = require('../middleware/auth');
const { validateObjectId } = require('../middleware/validate');

router.post('/validate', protect, validateCoupon);
router.get('/', protect, authorize('admin', 'staff'), getAllCoupons);
router.post('/', protect, authorize('admin'), createCoupon);
router.put('/:id', validateObjectId, protect, authorize('admin'), updateCoupon);
router.delete('/:id', validateObjectId, protect, authorize('admin'), deleteCoupon);

module.exports = router;
