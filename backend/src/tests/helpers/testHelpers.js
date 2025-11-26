/**
 * Test Helper Functions
 * Reusable utilities for testing
 */

const jwt = require('jsonwebtoken');
const User = require('../../models/User');
const Restaurant = require('../../models/Restaurant');
const MenuItem = require('../../models/MenuItem');
const Order = require('../../models/Order');

/**
 * Create a test user with specified role
 */
const createTestUser = async (role = 'customer', additionalData = {}) => {
  const userData = {
    name: `Test ${role.charAt(0).toUpperCase() + role.slice(1)}`,
    email: `test.${role}@example.com`,
    password: 'Password123!',
    phone: `+91${Math.floor(Math.random() * 9000000000) + 1000000000}`,
    role,
    isActive: true,
    ...additionalData
  };

  const user = await User.create(userData);
  return user;
};

/**
 * Generate JWT token for testing
 */
const generateTestToken = (userId, role = 'customer', restaurantId = null) => {
  const payload = { userId, role };
  if (restaurantId) {
    payload.restaurantId = restaurantId;
  }
  return jwt.sign(
    payload,
    process.env.JWT_SECRET || 'test-secret-key',
    { expiresIn: '1h' }
  );
};

/**
 * Create test restaurant
 */
const createTestRestaurant = async (vendorId, additionalData = {}) => {
  const restaurantData = {
    name: 'Test Restaurant',
    ownerId: vendorId,
    description: 'A test restaurant',
    location: {
      street: '123 Test Street',
      city: 'Bangalore',
      state: 'Karnataka',
      zipCode: '560001',
      coordinates: {
        type: 'Point',
        coordinates: [77.5946, 12.9716] // [longitude, latitude]
      }
    },
    contactInfo: {
      phone: '+919876543210',
      email: 'test.restaurant@example.com'
    },
    cuisines: ['Indian', 'Chinese'],
    deliveryTime: { min: 30, max: 45 },
    minimumOrder: 100,
    rating: { average: 4.5, count: 100 },
    isActive: true,
    isApproved: true,
    openingHours: [
      { day: 'Monday', open: '09:00', close: '22:00' },
      { day: 'Tuesday', open: '09:00', close: '22:00' },
      { day: 'Wednesday', open: '09:00', close: '22:00' },
      { day: 'Thursday', open: '09:00', close: '22:00' },
      { day: 'Friday', open: '09:00', close: '22:00' },
      { day: 'Saturday', open: '09:00', close: '23:00' },
      { day: 'Sunday', open: '09:00', close: '23:00' }
    ],
    ...additionalData
  };

  const restaurant = await Restaurant.create(restaurantData);
  return restaurant;
};

/**
 * Create test menu item
 */
const createTestMenuItem = async (restaurantId, additionalData = {}) => {
  const menuItemData = {
    restaurantId,
    name: 'Test Menu Item',
    description: 'A delicious test item',
    price: 150,
    category: 'Main Course',
    isVeg: true,
    isAvailable: true,
    images: ['https://example.com/image.jpg'],
    ...additionalData
  };

  const menuItem = await MenuItem.create(menuItemData);
  return menuItem;
};

/**
 * Create test order
 */
const createTestOrder = async (customerId, restaurantId, items, additionalData = {}) => {
  const orderData = {
    customerId,
    restaurantId,
    items,
    deliveryAddress: {
      street: '123 Test Street',
      city: 'Bangalore',
      state: 'Karnataka',
      zipCode: '560001',
      location: {
        type: 'Point',
        coordinates: [77.5946, 12.9716]
      }
    },
    contactPhone: '+919876543210',
    pricing: {
      subtotal: 300,
      deliveryFee: 40,
      taxes: 30.6,
      discount: 0,
      platformFee: 5,
      total: 375.6
    },
    paymentInfo: {
      method: 'cod', // Valid enum: 'cod', 'card', 'upi', 'wallet', 'razorpay', 'mock'
      status: 'pending'
    },
    status: 'pending',
    ...additionalData
  };

  const order = await Order.create(orderData);
  return order;
};

/**
 * Mock request object
 */
const mockRequest = (overrides = {}) => {
  return {
    body: {},
    params: {},
    query: {},
    headers: {},
    user: null,
    ...overrides
  };
};

/**
 * Mock response object
 */
const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};

/**
 * Mock next function
 */
const mockNext = () => jest.fn();

module.exports = {
  createTestUser,
  generateTestToken,
  createTestRestaurant,
  createTestMenuItem,
  createTestOrder,
  mockRequest,
  mockResponse,
  mockNext
};
