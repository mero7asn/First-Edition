const express = require('express');
const router = express.Router();
const { register, login, getProfile, updateProfile, addToWishlist, removeFromWishlist } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { validateObjectId } = require('../middleware/validate');

router.post('/register', register);
router.post('/login', login);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.post('/wishlist', protect, addToWishlist);
router.delete('/wishlist/:productId', validateObjectId, protect, removeFromWishlist);

module.exports = router;
