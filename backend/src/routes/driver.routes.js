const express = require('express');
const router = express.Router();
const driverController = require('../controllers/driver.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
const { roleMiddleware } = require('../middleware/role.middleware');
const { validate, schemas } = require('../middleware/validation.middleware');
const { locationUpdateLimiter } = require('../middleware/rateLimiter.middleware');

// All routes require driver authentication
router.use(authMiddleware, roleMiddleware('driver'));

// Location management
router.patch(
  '/location',
  locationUpdateLimiter,
  validate(schemas.updateLocation),
  driverController.updateLocation
);

router.patch(
  '/availability',
  driverController.toggleAvailability
);

// Orders
router.get(
  '/orders',
  driverController.getAssignedOrders
);

router.post(
  '/orders/:orderId/accept',
  driverController.acceptOrder
);

router.post(
  '/orders/:orderId/reject',
  driverController.rejectOrder
);

// Earnings & Stats
router.get(
  '/earnings',
  driverController.getEarnings
);

router.get(
  '/stats',
  driverController.getDriverStats
);

module.exports = router;
