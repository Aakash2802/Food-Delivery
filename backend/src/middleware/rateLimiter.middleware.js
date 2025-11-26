const rateLimit = require('express-rate-limit');
const config = require('../config/env');

// General API limiter
const apiLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Strict limiter for auth endpoints (increased for testing)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window (increased from 5 for Cypress testing)
  skipSuccessfulRequests: true,
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again after 15 minutes.'
  }
});

// Limiter for payment endpoints
const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: 'Too many payment requests, please try again later.'
  }
});

// Limiter for order creation
const orderLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 3, // 3 orders per minute
  message: {
    success: false,
    message: 'Too many orders placed, please wait a moment.'
  }
});

// Limiter for driver location updates (more lenient)
const locationUpdateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60, // 1 update per second
  message: {
    success: false,
    message: 'Location update rate limit exceeded.'
  }
});

module.exports = {
  apiLimiter,
  authLimiter,
  paymentLimiter,
  orderLimiter,
  locationUpdateLimiter
};
