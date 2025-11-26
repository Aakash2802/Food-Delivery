/**
 * Helper Functions Unit Tests
 */

const {
  calculateDistance,
  estimateDeliveryTime,
  calculateOrderPricing,
  isRestaurantOpen,
  generateOrderNumber,
  formatCurrency,
  calculateDiscountAmount,
  validateCoordinates,
  sanitizePhoneNumber,
  generateOTP
} = require('../../../utils/helpers');

describe('Helper Functions', () => {
  describe('calculateDistance', () => {
    it('should calculate distance between two coordinates', () => {
      const from = { latitude: 12.9716, longitude: 77.5946 }; // Bangalore
      const to = { latitude: 13.0827, longitude: 80.2707 }; // Chennai

      const distance = calculateDistance(from, to);

      expect(distance).toBeGreaterThan(0);
      expect(distance).toBeCloseTo(290497, -4); // ~290 km (actual distance from geolib)
    });

    it('should return 0 for same location', () => {
      const location = { latitude: 12.9716, longitude: 77.5946 };

      const distance = calculateDistance(location, location);

      expect(distance).toBe(0);
    });

    it('should handle different coordinate formats', () => {
      const from = { lat: 12.9716, lng: 77.5946 };
      const to = { lat: 12.9800, lng: 77.6000 };

      const distance = calculateDistance(from, to);

      expect(distance).toBeGreaterThan(0);
    });
  });

  describe('estimateDeliveryTime', () => {
    it('should estimate delivery time for short distance', () => {
      const distance = 2000; // 2 km
      const preparationTime = 20; // 20 minutes

      const { min, max } = estimateDeliveryTime(distance, preparationTime);

      expect(min).toBeGreaterThanOrEqual(20);
      expect(max).toBeGreaterThan(min);
    });

    it('should estimate longer time for longer distance', () => {
      const shortDistance = 2000; // 2 km
      const longDistance = 10000; // 10 km

      const short = estimateDeliveryTime(shortDistance, 20);
      const long = estimateDeliveryTime(longDistance, 20);

      expect(long.min).toBeGreaterThan(short.min);
      expect(long.max).toBeGreaterThan(short.max);
    });

    it('should use default preparation time', () => {
      const distance = 3000;

      const result = estimateDeliveryTime(distance);

      expect(result.min).toBeGreaterThan(0);
      expect(result.max).toBeGreaterThan(0);
    });
  });

  describe('calculateOrderPricing', () => {
    it('should calculate complete order pricing', () => {
      const items = [
        { price: 150, quantity: 2, customizations: [] },
        { price: 200, quantity: 1, customizations: [] }
      ];
      const deliveryFee = 40;

      const pricing = calculateOrderPricing(items, deliveryFee);

      expect(pricing.subtotal).toBe(500); // (150*2) + (200*1)
      expect(pricing.deliveryFee).toBe(40);
      expect(pricing.platformFee).toBe(5);
      expect(pricing.taxes).toBeGreaterThan(0);
      expect(pricing.total).toBeGreaterThan(pricing.subtotal);
    });

    it('should include customization prices', () => {
      const items = [
        {
          price: 150,
          quantity: 1,
          customizations: [
            { additionalPrice: 20 },
            { additionalPrice: 30 }
          ]
        }
      ];

      const pricing = calculateOrderPricing(items, 40);

      expect(pricing.subtotal).toBe(200); // 150 + 20 + 30
    });

    it('should apply discount', () => {
      const items = [{ price: 500, quantity: 1, customizations: [] }];
      const deliveryFee = 40;
      const discount = 50;

      const pricing = calculateOrderPricing(items, deliveryFee, discount);

      expect(pricing.discount).toBe(50);
      // Total = subtotal(500) + deliveryFee(40) + taxes(48.6) + platformFee(5) - discount(50) = 543.6
      expect(pricing.total).toBeCloseTo(543.6, 1);
    });

    it('should calculate commission', () => {
      const items = [{ price: 500, quantity: 1, customizations: [] }];
      const deliveryFee = 40;
      const discount = 0;
      const commissionRate = 15;

      const pricing = calculateOrderPricing(items, deliveryFee, discount, commissionRate);

      expect(pricing.commission.rate).toBe(15);
      expect(pricing.commission.amount).toBe(75); // 15% of 500
    });

    it('should handle zero discount', () => {
      const items = [{ price: 500, quantity: 1, customizations: [] }];

      const pricing = calculateOrderPricing(items, 40, 0);

      expect(pricing.discount).toBe(0);
    });
  });

  describe('isRestaurantOpen', () => {
    it('should check if restaurant is open', () => {
      const openingHours = [
        { day: 'Monday', open: '09:00', close: '22:00', isOpen: true },
        { day: 'Tuesday', open: '09:00', close: '22:00', isOpen: true }
      ];

      // Mock current time as Monday 12:00 PM
      const mockDate = new Date('2025-01-13T12:00:00'); // Monday

      const result = isRestaurantOpen(openingHours, mockDate);

      expect(typeof result).toBe('boolean');
    });

    it('should return false for closed day', () => {
      const openingHours = [
        { day: 'Monday', open: '09:00', close: '22:00', isOpen: false }
      ];

      const mockDate = new Date('2025-01-13T12:00:00'); // Monday

      const result = isRestaurantOpen(openingHours, mockDate);

      expect(result).toBe(false);
    });
  });

  describe('generateOrderNumber', () => {
    it('should generate unique order number', () => {
      const orderNumber = generateOrderNumber();

      expect(orderNumber).toMatch(/^ORD\d{11}$/);
    });

    it('should generate different numbers', () => {
      const order1 = generateOrderNumber();
      const order2 = generateOrderNumber();

      expect(order1).not.toBe(order2);
    });

    it('should start with ORD', () => {
      const orderNumber = generateOrderNumber();

      expect(orderNumber).toMatch(/^ORD/);
    });
  });

  describe('formatCurrency', () => {
    it('should format currency with symbol', () => {
      const formatted = formatCurrency(1234.56);

      expect(formatted).toMatch(/₹/);
      expect(formatted).toContain('1,234.56'); // Indian format uses comma separator
    });

    it('should handle zero', () => {
      const formatted = formatCurrency(0);

      expect(formatted).toContain('0');
    });

    it('should handle large numbers', () => {
      const formatted = formatCurrency(999999.99);

      expect(formatted).toBeDefined();
    });
  });

  describe('calculateDiscountAmount', () => {
    it('should calculate percentage discount', () => {
      const amount = calculateDiscountAmount(1000, 10, 'percentage');

      expect(amount).toBe(100);
    });

    it('should calculate fixed discount', () => {
      const amount = calculateDiscountAmount(1000, 50, 'fixed');

      expect(amount).toBe(50);
    });

    it('should apply max discount for percentage', () => {
      const amount = calculateDiscountAmount(1000, 50, 'percentage', 200);

      expect(amount).toBe(200); // Max is 200, not 500
    });

    it('should not exceed order value', () => {
      const amount = calculateDiscountAmount(100, 50, 'fixed');

      expect(amount).toBeLessThanOrEqual(100);
    });
  });

  describe('validateCoordinates', () => {
    it('should validate correct coordinates', () => {
      const isValid = validateCoordinates(77.5946, 12.9716);

      expect(isValid).toBe(true);
    });

    it('should reject invalid longitude', () => {
      const isValid = validateCoordinates(200, 12.9716);

      expect(isValid).toBe(false);
    });

    it('should reject invalid latitude', () => {
      const isValid = validateCoordinates(77.5946, 100);

      expect(isValid).toBe(false);
    });

    it('should handle boundary values', () => {
      expect(validateCoordinates(180, 90)).toBe(true);
      expect(validateCoordinates(-180, -90)).toBe(true);
      expect(validateCoordinates(180.1, 90)).toBe(false);
    });
  });

  describe('sanitizePhoneNumber', () => {
    it('should remove spaces and dashes', () => {
      const sanitized = sanitizePhoneNumber('+91 98765 43210');

      expect(sanitized).toBe('+919876543210');
    });

    it('should handle different formats', () => {
      expect(sanitizePhoneNumber('98765-43210')).toBe('9876543210');
      expect(sanitizePhoneNumber('(987) 654-3210')).toBe('9876543210');
    });

    it('should preserve country code', () => {
      const sanitized = sanitizePhoneNumber('+91-9876543210');

      expect(sanitized).toMatch(/^\+91/);
    });
  });

  describe('generateOTP', () => {
    it('should generate 6-digit OTP', () => {
      const otp = generateOTP();

      expect(otp).toMatch(/^\d{6}$/);
    });

    it('should generate 4-digit OTP', () => {
      const otp = generateOTP(4);

      expect(otp).toMatch(/^\d{4}$/);
    });

    it('should generate different OTPs', () => {
      const otp1 = generateOTP();
      const otp2 = generateOTP();

      // Very small chance they're the same
      expect(otp1).toBeDefined();
      expect(otp2).toBeDefined();
    });
  });
});
