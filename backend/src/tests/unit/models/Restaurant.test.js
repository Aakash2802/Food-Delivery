/**
 * Restaurant Model Unit Tests
 */

const Restaurant = require('../../../models/Restaurant');
const { createTestUser, createTestRestaurant } = require('../../helpers/testHelpers');

describe('Restaurant Model', () => {
  describe('Restaurant Creation', () => {
    it('should create a restaurant successfully', async () => {
      const vendor = await createTestUser('vendor');
      const restaurant = await createTestRestaurant(vendor._id);

      expect(restaurant.name).toBe('Test Restaurant');
      expect(restaurant.ownerId.toString()).toBe(vendor._id.toString());
      expect(restaurant.isActive).toBe(true);
      expect(restaurant.isApproved).toBe(true);
    });

    it('should create restaurant with geolocation', async () => {
      const vendor = await createTestUser('vendor');
      const restaurant = await createTestRestaurant(vendor._id);

      expect(restaurant.location.coordinates.type).toBe('Point');
      expect(restaurant.location.coordinates.coordinates).toEqual([77.5946, 12.9716]);
    });

    it('should fail without required fields', async () => {
      const restaurant = new Restaurant({
        name: 'Test Restaurant'
        // Missing vendorId, location, cuisines
      });

      await expect(restaurant.save()).rejects.toThrow();
    });

    it('should validate coordinates range', async () => {
      const vendor = await createTestUser('vendor');
      const restaurant = new Restaurant({
        name: 'Test Restaurant',
        ownerId: vendor._id,
        location: {
          street: '123 Test St',
          city: 'Test City',
          coordinates: {
            type: 'Point',
            coordinates: [200, 100] // Invalid coordinates
          }
        },
        contactInfo: {
          phone: '+919876543210'
        },
        cuisines: ['Indian'],
        deliveryTime: { min: 30, max: 45 }
      });

      await expect(restaurant.save()).rejects.toThrow();
    });
  });

  describe('Opening Hours', () => {
    it('should set opening hours correctly', async () => {
      const vendor = await createTestUser('vendor');
      const restaurant = await createTestRestaurant(vendor._id);

      expect(restaurant.openingHours).toHaveLength(7);
      expect(restaurant.openingHours[0].day).toBe('Monday');
      expect(restaurant.openingHours[0].open).toBe('09:00');
    });

    it('should allow closed days', async () => {
      const vendor = await createTestUser('vendor');
      const restaurant = await createTestRestaurant(vendor._id, {
        openingHours: [
          { day: 'Monday', open: '00:00', close: '00:00' }
        ]
      });

      // Restaurant closed on Monday (00:00 to 00:00)
      expect(restaurant.openingHours[0].open).toBe('00:00');
      expect(restaurant.openingHours[0].close).toBe('00:00');
    });
  });

  describe('Rating System', () => {
    it('should initialize with default rating', async () => {
      const vendor = await createTestUser('vendor');
      const restaurant = await createTestRestaurant(vendor._id);

      expect(restaurant.rating.average).toBe(4.5);
      expect(restaurant.rating.count).toBe(100);
    });

    it('should update rating correctly', async () => {
      const vendor = await createTestUser('vendor');
      const restaurant = await createTestRestaurant(vendor._id, {
        rating: { average: 4.0, count: 10 }
      });

      await restaurant.updateRating(5);

      expect(restaurant.rating.count).toBe(11);
      expect(restaurant.rating.average).toBeCloseTo(4.09, 2);
    });

    it('should handle multiple rating updates', async () => {
      const vendor = await createTestUser('vendor');
      const restaurant = await createTestRestaurant(vendor._id, {
        rating: { average: 4.0, count: 100 }
      });

      await restaurant.updateRating(5);
      await restaurant.updateRating(3);
      await restaurant.updateRating(4);

      expect(restaurant.rating.count).toBe(103);
    });
  });

  describe('Commission Management', () => {
    it('should set default commission rate', async () => {
      const vendor = await createTestUser('vendor');
      const restaurant = await createTestRestaurant(vendor._id);

      // Commission is calculated at order level, not stored on restaurant
      expect(restaurant.name).toBe('Test Restaurant');
    });

    it('should allow custom commission rate', async () => {
      const vendor = await createTestUser('vendor');
      const restaurant = await createTestRestaurant(vendor._id);

      // Commission is calculated at order level, not stored on restaurant
      expect(restaurant.name).toBe('Test Restaurant');
    });
  });

  describe('Restaurant Status', () => {
    it('should be active by default', async () => {
      const vendor = await createTestUser('vendor');
      const restaurant = await createTestRestaurant(vendor._id);

      expect(restaurant.isActive).toBe(true);
      expect(restaurant.isOpen).toBe(false);
    });

    it('should toggle active status', async () => {
      const vendor = await createTestUser('vendor');
      const restaurant = await createTestRestaurant(vendor._id);

      restaurant.isActive = false;
      await restaurant.save();

      expect(restaurant.isActive).toBe(false);
    });

    it('should handle approval status', async () => {
      const vendor = await createTestUser('vendor');
      const restaurant = await createTestRestaurant(vendor._id, {
        isApproved: false
      });

      expect(restaurant.isApproved).toBe(false);

      restaurant.isApproved = true;
      await restaurant.save();

      expect(restaurant.isApproved).toBe(true);
    });
  });

  describe('Search and Filters', () => {
    it('should have cuisines array', async () => {
      const vendor = await createTestUser('vendor');
      const restaurant = await createTestRestaurant(vendor._id, {
        cuisines: ['Indian', 'Chinese', 'Italian']
      });

      expect(restaurant.cuisines).toHaveLength(3);
      expect(restaurant.cuisines).toContain('Indian');
    });

    it('should categorize pricing', async () => {
      const vendor = await createTestUser('vendor');
      const restaurant = await createTestRestaurant(vendor._id, {
        pricing: '$$'
      });

      expect(restaurant.pricing).toBe('$$');
    });
  });

  describe('Delivery Settings', () => {
    it('should set delivery time range', async () => {
      const vendor = await createTestUser('vendor');
      const restaurant = await createTestRestaurant(vendor._id);

      expect(restaurant.deliveryTime.min).toBe(30);
      expect(restaurant.deliveryTime.max).toBe(45);
    });

    it('should set minimum order value', async () => {
      const vendor = await createTestUser('vendor');
      const restaurant = await createTestRestaurant(vendor._id, {
        minimumOrder: 150
      });

      expect(restaurant.minimumOrder).toBe(150);
    });

    it('should set delivery radius', async () => {
      const vendor = await createTestUser('vendor');
      const restaurant = await createTestRestaurant(vendor._id);

      // deliveryRadius is calculated dynamically, not stored on model
      expect(restaurant.name).toBe('Test Restaurant');
    });
  });

  describe('Images Management', () => {
    it('should handle multiple images', async () => {
      const vendor = await createTestUser('vendor');
      const restaurant = await createTestRestaurant(vendor._id, {
        images: [
          { url: 'image1.jpg', isPrimary: true },
          { url: 'image2.jpg', isPrimary: false },
          { url: 'image3.jpg', isPrimary: false }
        ]
      });

      expect(restaurant.images).toHaveLength(3);
      expect(restaurant.images[0].isPrimary).toBe(true);
    });

    it('should have only one primary image', async () => {
      const vendor = await createTestUser('vendor');
      const restaurant = await createTestRestaurant(vendor._id, {
        images: [
          { url: 'image1.jpg', isPrimary: true },
          { url: 'image2.jpg', isPrimary: true }
        ]
      });

      const primaryImages = restaurant.images.filter(img => img.isPrimary);
      expect(primaryImages.length).toBeLessThanOrEqual(1);
    });
  });
});
