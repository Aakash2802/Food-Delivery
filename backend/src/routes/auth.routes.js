const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
const { validate, schemas } = require('../middleware/validation.middleware');
const { authLimiter } = require('../middleware/rateLimiter.middleware');

// Public routes
router.post(
  '/signup',
  authLimiter,
  validate(schemas.signup),
  authController.signup
);

router.post(
  '/login',
  authLimiter,
  validate(schemas.login),
  authController.login
);

router.post(
  '/refresh',
  authController.refreshToken
);

// Protected routes
router.use(authMiddleware); // All routes below require authentication

router.post('/logout', authController.logout);

router.get('/me', authController.getProfile);

router.put('/profile', authController.updateProfile);

router.put('/change-password', authController.changePassword);

// Address management
router.post('/addresses', authController.addAddress);

router.put('/addresses/:addressId', authController.updateAddress);

router.delete('/addresses/:addressId', authController.deleteAddress);

module.exports = router;
