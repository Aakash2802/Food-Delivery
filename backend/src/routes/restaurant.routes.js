const express = require('express');
const router = express.Router();
const restaurantController = require('../controllers/restaurant.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
const { roleMiddleware } = require('../middleware/role.middleware');
const { validate, schemas } = require('../middleware/validation.middleware');

// Public routes
router.get(
  '/',
  validate(schemas.restaurantFilters, 'query'),
  restaurantController.getRestaurants
);

// Vendor routes (MUST come before /:id route!)
router.get(
  '/vendor/restaurant',
  authMiddleware,
  roleMiddleware('vendor'),
  restaurantController.getVendorRestaurant
);

router.get('/:id', restaurantController.getRestaurantById);

router.post(
  '/vendor/restaurant',
  authMiddleware,
  roleMiddleware('vendor'),
  validate(schemas.createRestaurant),
  restaurantController.createVendorRestaurant
);

router.put(
  '/vendor/restaurant',
  authMiddleware,
  roleMiddleware('vendor'),
  restaurantController.updateRestaurant
);

router.patch(
  '/vendor/restaurant/status',
  authMiddleware,
  roleMiddleware('vendor'),
  restaurantController.toggleRestaurantStatus
);

// Admin routes
router.post(
  '/admin/restaurants',
  authMiddleware,
  roleMiddleware('admin'),
  validate(schemas.createRestaurant),
  restaurantController.createRestaurant
);

router.put(
  '/admin/restaurants/:id',
  authMiddleware,
  roleMiddleware('admin'),
  validate(schemas.updateRestaurant),
  restaurantController.updateRestaurant
);

router.delete(
  '/admin/restaurants/:id',
  authMiddleware,
  roleMiddleware('admin'),
  restaurantController.deleteRestaurant
);

router.patch(
  '/admin/restaurants/:id/commission',
  authMiddleware,
  roleMiddleware('admin'),
  restaurantController.updateCommission
);

router.patch(
  '/admin/restaurants/:id/approve',
  authMiddleware,
  roleMiddleware('admin'),
  restaurantController.approveRestaurant
);

router.patch(
  '/admin/restaurants/:id/reject',
  authMiddleware,
  roleMiddleware('admin'),
  restaurantController.rejectRestaurant
);

module.exports = router;
