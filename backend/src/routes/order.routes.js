const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
const { roleMiddleware } = require('../middleware/role.middleware');
const { validate, schemas } = require('../middleware/validation.middleware');
const { orderLimiter } = require('../middleware/rateLimiter.middleware');

// All routes require authentication
router.use(authMiddleware);

// Customer routes
router.post(
  '/',
  roleMiddleware('customer'),
  orderLimiter,
  validate(schemas.createOrder),
  orderController.createOrder
);

router.get(
  '/',
  orderController.getUserOrders
);

router.get(
  '/:orderId',
  orderController.getOrderById
);

router.post(
  '/:orderId/cancel',
  roleMiddleware('customer'),
  orderController.cancelOrder
);

// Vendor routes
router.patch(
  '/vendor/:orderId/status',
  roleMiddleware('vendor'),
  validate(schemas.updateOrderStatus),
  orderController.updateOrderStatusVendor
);

// Driver routes
router.patch(
  '/driver/:orderId/status',
  roleMiddleware('driver'),
  validate(schemas.updateOrderStatus),
  orderController.updateOrderStatusDriver
);

// Admin routes
router.post(
  '/admin/:orderId/assign',
  roleMiddleware('admin'),
  orderController.assignDriver
);

router.get(
  '/stats/summary',
  roleMiddleware('vendor', 'admin'),
  orderController.getOrderStats
);

module.exports = router;
