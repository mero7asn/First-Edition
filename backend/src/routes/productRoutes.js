const express = require('express');
const router = express.Router();
const { getAllProducts, getProduct, createProduct, updateProduct, deleteProduct, getFeaturedProducts, toggleAvailability } = require('../controllers/productController');
const { protect, authorize } = require('../middleware/auth');
const { validateObjectId } = require('../middleware/validate');

router.get('/', getAllProducts);
router.get('/featured', getFeaturedProducts);
router.get('/:id', validateObjectId, getProduct);
router.post('/', protect, authorize('admin', 'staff'), createProduct);
router.put('/:id', validateObjectId, protect, authorize('admin', 'staff'), updateProduct);
router.patch('/:id/toggle-availability', validateObjectId, protect, authorize('admin', 'staff'), toggleAvailability);
router.delete('/:id', validateObjectId, protect, authorize('admin'), deleteProduct);

module.exports = router;
