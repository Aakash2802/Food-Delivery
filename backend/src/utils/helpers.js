const { getDistance } = require('geolib');

/**
 * Calculate distance between two coordinates in meters
 */
const calculateDistance = (from, to) => {
  // Handle different coordinate formats
  const fromCoords = {
    latitude: from.latitude || from.lat,
    longitude: from.longitude || from.lng
  };

  const toCoords = {
    latitude: to.latitude || to.lat,
    longitude: to.longitude || to.lng
  };

  const distanceInMeters = getDistance(fromCoords, toCoords);

  return distanceInMeters; // Return in meters
};

/**
 * Estimate delivery time based on distance (in meters)
 */
const estimateDeliveryTime = (distanceInMeters, preparationTime = 20) => {
  // Convert meters to km
  const distanceKm = distanceInMeters / 1000;

  // Assume average speed of 20 km/h for delivery
  const travelTimeMinutes = Math.ceil((distanceKm / 20) * 60);

  const minTime = preparationTime + travelTimeMinutes;
  const maxTime = minTime + 10; // Add 10 minutes buffer

  return {
    min: minTime,
    max: maxTime
  };
};

/**
 * Format currency (INR)
 */
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(amount);
};

/**
 * Calculate order pricing
 */
const calculateOrderPricing = (items, deliveryFee = 0, promoDiscount = 0, commissionRate = 15) => {
  const subtotal = items.reduce((total, item) => {
    const itemPrice = item.price;
    const customizationPrice = item.customizations?.reduce(
      (sum, c) => sum + (c.additionalPrice || 0),
      0
    ) || 0;
    return total + ((itemPrice + customizationPrice) * item.quantity);
  }, 0);

  const platformFee = 5; // Fixed platform fee
  const taxRate = 0.09; // 9% GST

  const taxes = Math.round((subtotal + deliveryFee) * taxRate * 100) / 100;
  const total = subtotal + deliveryFee + taxes + platformFee - promoDiscount;

  const commissionAmount = Math.round((subtotal * commissionRate) / 100 * 100) / 100;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    deliveryFee: Math.round(deliveryFee * 100) / 100,
    taxes: Math.round(taxes * 100) / 100,
    discount: Math.round(promoDiscount * 100) / 100,
    platformFee: Math.round(platformFee * 100) / 100,
    total: Math.round(total * 100) / 100,
    commission: {
      rate: commissionRate,
      amount: commissionAmount
    }
  };
};

/**
 * Check if restaurant is currently open
 */
const isRestaurantOpen = (openingHours, currentDate = null) => {
  const now = currentDate || new Date();
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const currentDay = dayNames[now.getDay()];

  const todayHours = openingHours.find(h => h.day === currentDay);

  if (!todayHours || !todayHours.isOpen) {
    return false;
  }

  const [openHour, openMinute] = todayHours.open.split(':').map(Number);
  const [closeHour, closeMinute] = todayHours.close.split(':').map(Number);

  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const openMinutes = openHour * 60 + openMinute;
  const closeMinutes = closeHour * 60 + closeMinute;

  return currentMinutes >= openMinutes && currentMinutes <= closeMinutes;
};

/**
 * Generate random order number
 */
const generateOrderNumber = () => {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `ORD${timestamp}${random}`;
};

/**
 * Paginate results
 */
const paginate = (query, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;
  return query.skip(skip).limit(limit);
};

/**
 * Build pagination response
 */
const buildPaginationResponse = (data, page, limit, total) => {
  return {
    data,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit),
      hasMore: page * limit < total
    }
  };
};

/**
 * Sanitize user object (remove sensitive fields)
 */
const sanitizeUser = (user) => {
  const userObj = user.toObject ? user.toObject() : user;
  delete userObj.password;
  delete userObj.refreshTokens;
  return userObj;
};

/**
 * Generate random string
 */
const generateRandomString = (length = 10) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

/**
 * Sleep/delay function
 */
const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Get time ago string
 */
const getTimeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);

  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60
  };

  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit);
    if (interval >= 1) {
      return `${interval} ${unit}${interval !== 1 ? 's' : ''} ago`;
    }
  }

  return 'Just now';
};

/**
 * Calculate discount amount
 */
const calculateDiscountAmount = (orderValue, discountValue, discountType, maxDiscount = null) => {
  let discountAmount = 0;

  if (discountType === 'percentage') {
    discountAmount = (orderValue * discountValue) / 100;

    // Apply max discount limit if provided
    if (maxDiscount && discountAmount > maxDiscount) {
      discountAmount = maxDiscount;
    }
  } else if (discountType === 'fixed') {
    discountAmount = discountValue;
  }

  // Ensure discount doesn't exceed order value
  if (discountAmount > orderValue) {
    discountAmount = orderValue;
  }

  return discountAmount;
};

/**
 * Validate coordinates
 */
const validateCoordinates = (longitude, latitude) => {
  return (
    longitude >= -180 && longitude <= 180 &&
    latitude >= -90 && latitude <= 90
  );
};

/**
 * Sanitize phone number
 */
const sanitizePhoneNumber = (phone) => {
  if (!phone) return '';

  // Remove all spaces, dashes, and parentheses
  return phone.replace(/[\s\-()]/g, '');
};

/**
 * Generate OTP
 */
const generateOTP = (length = 6) => {
  const digits = '0123456789';
  let otp = '';

  for (let i = 0; i < length; i++) {
    otp += digits.charAt(Math.floor(Math.random() * digits.length));
  }

  return otp;
};

module.exports = {
  calculateDistance,
  estimateDeliveryTime,
  formatCurrency,
  calculateOrderPricing,
  isRestaurantOpen,
  generateOrderNumber,
  paginate,
  buildPaginationResponse,
  sanitizeUser,
  generateRandomString,
  sleep,
  getTimeAgo,
  calculateDiscountAmount,
  validateCoordinates,
  sanitizePhoneNumber,
  generateOTP
};
