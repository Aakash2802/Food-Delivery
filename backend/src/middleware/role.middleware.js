/**
 * Role-based access control middleware
 * @param {...string} allowedRoles - Roles that are allowed to access the route
 * @returns {Function} Express middleware function
 */
const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    // Check if user has required role
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role(s): ${allowedRoles.join(', ')}`
      });
    }

    next();
  };
};

// Middleware to check if user owns the resource
const checkOwnership = (resourceIdField = 'id', userIdField = '_id') => {
  return (req, res, next) => {
    const resourceId = req.params[resourceIdField];
    const userId = req.user[userIdField].toString();

    if (resourceId !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only access your own resources.'
      });
    }

    next();
  };
};

// Middleware to check if vendor owns the restaurant
const checkRestaurantOwnership = async (req, res, next) => {
  try {
    const Restaurant = require('../models/Restaurant');

    let restaurantId = req.params.restaurantId || req.params.id;

    // If not in params, might be in body for creation
    if (!restaurantId && req.body.restaurantId) {
      restaurantId = req.body.restaurantId;
    }

    if (!restaurantId) {
      return res.status(400).json({
        success: false,
        message: 'Restaurant ID is required.'
      });
    }

    // Admins can access all restaurants
    if (req.user.role === 'admin') {
      return next();
    }

    // Check if vendor owns the restaurant
    const restaurant = await Restaurant.findById(restaurantId);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found.'
      });
    }

    if (restaurant.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not own this restaurant.'
      });
    }

    req.restaurant = restaurant;
    next();
  } catch (error) {
    console.error('Check ownership error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking resource ownership.'
    });
  }
};

// Middleware to check if driver can access order
const checkDriverOrderAccess = async (req, res, next) => {
  try {
    const Order = require('../models/Order');
    const orderId = req.params.orderId || req.params.id;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'Order ID is required.'
      });
    }

    // Admins can access all orders
    if (req.user.role === 'admin') {
      return next();
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.'
      });
    }

    // Check if driver is assigned to this order
    if (!order.driverId || order.driverId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. This order is not assigned to you.'
      });
    }

    req.order = order;
    next();
  } catch (error) {
    console.error('Check driver order access error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking order access.'
    });
  }
};

module.exports = {
  roleMiddleware,
  checkOwnership,
  checkRestaurantOwnership,
  checkDriverOrderAccess
};
