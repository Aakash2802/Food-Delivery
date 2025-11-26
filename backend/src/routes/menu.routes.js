const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menu.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
const { roleMiddleware } = require('../middleware/role.middleware');
const { validate, schemas } = require('../middleware/validation.middleware');

// Public routes
router.get('/search', menuController.searchMenuItems);

router.get('/:itemId', menuController.getMenuItemById);

// Restaurant menu routes
router.get(
  '/restaurants/:restaurantId/menu',
  menuController.getRestaurantMenu
);

// Vendor routes
router.use(authMiddleware); // All routes below require authentication

router.get(
  '/vendor/menu',
  roleMiddleware('vendor'),
  menuController.getVendorMenuItems
);

router.post(
  '/vendor/menu',
  roleMiddleware('vendor'),
  validate(schemas.createMenuItem),
  menuController.createMenuItem
);

router.put(
  '/vendor/menu/:itemId',
  roleMiddleware('vendor'),
  menuController.updateMenuItem
);

router.patch(
  '/vendor/menu/:itemId/availability',
  roleMiddleware('vendor'),
  menuController.toggleAvailability
);

router.patch(
  '/vendor/menu/bulk-availability',
  roleMiddleware('vendor'),
  menuController.bulkUpdateAvailability
);

router.delete(
  '/vendor/menu/:itemId',
  roleMiddleware('vendor'),
  menuController.deleteMenuItem
);

module.exports = router;
