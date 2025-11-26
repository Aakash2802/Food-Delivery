const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
const { roleMiddleware } = require('../middleware/role.middleware');
const { validate, schemas } = require('../middleware/validation.middleware');

// All routes require admin authentication
router.use(authMiddleware, roleMiddleware('admin'));

// Dashboard
router.get('/dashboard/stats', adminController.getDashboardStats);

// User management
router.get('/users', adminController.getUsers);

router.patch('/users/:userId/status', adminController.updateUserStatus);

// Restaurant management
router.get('/restaurants', adminController.getAllRestaurants);

router.patch('/restaurants/:restaurantId/approve', adminController.approveRestaurant);

router.patch('/restaurants/:restaurantId/reject', adminController.rejectRestaurant);

// Driver management
router.get('/drivers', adminController.getDrivers);

// Order management
router.get('/orders/live', adminController.getLiveOrders);

// Reports
router.get('/reports/revenue', adminController.getRevenueReport);

router.get('/analytics', adminController.getAnalytics);

// Promo code management
router.get('/promos', adminController.getPromoCodes);

router.post(
  '/promos',
  validate(schemas.createPromoCode),
  adminController.createPromoCode
);

router.put('/promos/:promoId', adminController.updatePromoCode);

router.delete('/promos/:promoId', adminController.deletePromoCode);

module.exports = router;
