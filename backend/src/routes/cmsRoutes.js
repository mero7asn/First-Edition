const express = require('express');
const router = express.Router();
const { getActiveBanners, getAllBanners, createBanner, updateBanner, deleteBanner, subscribeNewsletter } = require('../controllers/cmsController');
const { protect, authorize } = require('../middleware/auth');
const { validateObjectId } = require('../middleware/validate');

router.get('/banners/active', getActiveBanners);
router.get('/banners', protect, authorize('admin', 'staff'), getAllBanners);
router.post('/banners', protect, authorize('admin'), createBanner);
router.put('/banners/:id', validateObjectId, protect, authorize('admin'), updateBanner);
router.delete('/banners/:id', validateObjectId, protect, authorize('admin'), deleteBanner);
router.post('/newsletter', subscribeNewsletter);

module.exports = router;
