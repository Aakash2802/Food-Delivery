const express = require('express');
const router = express.Router();
const promoController = require('../controllers/promo.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
const { roleMiddleware } = require('../middleware/role.middleware');

// Public routes
router.get('/', promoController.getActivePromoCodes);

// Customer routes
router.post(
  '/validate',
  authMiddleware,
  roleMiddleware('customer'),
  promoController.validatePromoCode
);

router.post(
  '/apply',
  authMiddleware,
  roleMiddleware('customer'),
  promoController.applyPromoCode
);

// Admin routes
router.get(
  '/admin/all',
  authMiddleware,
  roleMiddleware('admin'),
  promoController.getAllPromos
);

router.post(
  '/admin/create',
  authMiddleware,
  roleMiddleware('admin'),
  promoController.createPromo
);

router.put(
  '/admin/:id',
  authMiddleware,
  roleMiddleware('admin'),
  promoController.updatePromo
);

router.delete(
  '/admin/:id',
  authMiddleware,
  roleMiddleware('admin'),
  promoController.deletePromo
);

router.patch(
  '/admin/:id/toggle',
  authMiddleware,
  roleMiddleware('admin'),
  promoController.togglePromoStatus
);

module.exports = router;
