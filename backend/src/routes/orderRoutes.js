const express = require('express');
const router = express.Router();
const { createOrder, getMyOrders, getOrder, getAllOrders, updateOrderStatus, getOrderStats } = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');
const { validateObjectId } = require('../middleware/validate');

router.post('/', protect, createOrder);
router.get('/my-orders', protect, getMyOrders);
router.get('/stats', protect, authorize('admin', 'staff'), getOrderStats);
router.get('/', protect, authorize('admin', 'staff'), getAllOrders);
router.get('/:id', validateObjectId, protect, getOrder);
router.put('/:id', validateObjectId, protect, authorize('admin', 'staff'), updateOrderStatus);

module.exports = router;
