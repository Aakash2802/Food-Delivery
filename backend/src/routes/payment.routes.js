const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
const { paymentLimiter } = require('../middleware/rateLimiter.middleware');

// Webhook route (no auth required, but signature verified)
router.post('/webhook', paymentController.webhookHandler);

// All other routes require authentication
router.use(authMiddleware);

router.post(
  '/create',
  paymentLimiter,
  paymentController.createPaymentOrder
);

router.post(
  '/verify',
  paymentLimiter,
  paymentController.verifyPayment
);

router.post(
  '/mock',
  paymentLimiter,
  paymentController.mockPayment
);

router.get(
  '/history',
  paymentController.getPaymentHistory
);

module.exports = router;
