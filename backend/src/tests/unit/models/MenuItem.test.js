/**
 * MenuItem Model Unit Tests
 */

const MenuItem = require('../../../models/MenuItem');
const { createTestUser, createTestRestaurant, createTestMenuItem } = require('../../helpers/testHelpers');

describe('MenuItem Model', () => {
  describe('MenuItem Creation', () => {
    it('should create a menu item successfully', async () => {
      const vendor = await createTestUser('vendor');
      const restaurant = await createTestRestaurant(vendor._id);
      const menuItem = await createTestMenuItem(restaurant._id);

      expect(menuItem.name).toBe('Test Menu Item');
      expect(menuItem.restaurantId.toString()).toBe(restaurant._id.toString());
      expect(menuItem.isAvailable).toBe(true);
    });

    it('should fail without required fields', async () => {
      const menuItem = new MenuItem({
        name: 'Test Item'
        // Missing restaurantId, price, category
      });

      await expect(menuItem.save()).rejects.toThrow();
    });

    it('should validate price is positive', async () => {
      const vendor = await createTestUser('vendor');
      const restaurant = await createTestRestaurant(vendor._id);

      const menuItem = new MenuItem({
        restaurantId: restaurant._id,
        name: 'Test Item',
        price: -10, // Invalid negative price
        category: 'Test'
      });

      await expect(menuItem.save()).rejects.toThrow();
    });
  });

  describe('Customizations', () => {
    it('should add customizations to menu item', async () => {
      const vendor = await createTestUser('vendor');
      const restaurant = await createTestRestaurant(vendor._id);
      const menuItem = await createTestMenuItem(restaurant._id, {
        customizations: [
          {
            name: 'Size',
            isRequired: true,
            maxSelections: 1,
            options: [
              { label: 'Small', price: 0 },
              { label: 'Large', price: 50 }
            ]
          }
        ]
      });

      expect(menuItem.customizations).toHaveLength(1);
      expect(menuItem.customizations[0].name).toBe('Size');
      expect(menuItem.customizations[0].options).toHaveLength(2);
    });

    it('should handle multiple customizations', async () => {
      const vendor = await createTestUser('vendor');
      const restaurant = await createTestRestaurant(vendor._id);
      const menuItem = await createTestMenuItem(restaurant._id, {
        customizations: [
          { name: 'Size', isRequired: true, maxSelections: 1, options: [] },
          { name: 'Toppings', isRequired: false, maxSelections: 5, options: [] }
        ]
      });

      expect(menuItem.customizations).toHaveLength(2);
    });
  });

  describe('Dietary Flags', () => {
    it('should set vegetarian flag', async () => {
      const vendor = await createTestUser('vendor');
      const restaurant = await createTestRestaurant(vendor._id);
      const menuItem = await createTestMenuItem(restaurant._id, {
        isVeg: true
      });

      expect(menuItem.isVeg).toBe(true);
    });

    it('should set vegan and gluten-free flags', async () => {
      const vendor = await createTestUser('vendor');
      const restaurant = await createTestRestaurant(vendor._id);
      const menuItem = await createTestMenuItem(restaurant._id, {
        isVegan: true,
        isGlutenFree: true
      });

      expect(menuItem.isVegan).toBe(true);
      expect(menuItem.isGlutenFree).toBe(true);
    });
  });

  describe('Discount Calculations', () => {
    it('should calculate discount percentage', async () => {
      const vendor = await createTestUser('vendor');
      const restaurant = await createTestRestaurant(vendor._id);
      const menuItem = await createTestMenuItem(restaurant._id, {
        price: 100,
        originalPrice: 150
      });

      expect(menuItem.discountPercentage).toBeCloseTo(33, 0);
    });

    it('should return 0 discount if no original price', async () => {
      const vendor = await createTestUser('vendor');
      const restaurant = await createTestRestaurant(vendor._id);
      const menuItem = await createTestMenuItem(restaurant._id, {
        price: 100
      });

      expect(menuItem.discountPercentage).toBe(0);
    });
  });

  describe('Availability Management', () => {
    it('should toggle availability', async () => {
      const vendor = await createTestUser('vendor');
      const restaurant = await createTestRestaurant(vendor._id);
      const menuItem = await createTestMenuItem(restaurant._id, {
        isAvailable: true
      });

      menuItem.isAvailable = false;
      await menuItem.save();

      expect(menuItem.isAvailable).toBe(false);
    });
  });

  describe('Images', () => {
    it('should handle multiple images', async () => {
      const vendor = await createTestUser('vendor');
      const restaurant = await createTestRestaurant(vendor._id);
      const menuItem = await createTestMenuItem(restaurant._id, {
        images: ['image1.jpg', 'image2.jpg', 'image3.jpg']
      });

      expect(menuItem.images).toHaveLength(3);
    });
  });

  describe('Spice Level', () => {
    it('should set spice level', async () => {
      const vendor = await createTestUser('vendor');
      const restaurant = await createTestRestaurant(vendor._id);
      const menuItem = await createTestMenuItem(restaurant._id, {
        spiceLevel: 'medium'
      });

      expect(menuItem.spiceLevel).toBe('medium');
    });
  });

  describe('Popularity Tracking', () => {
    it('should track order count', async () => {
      const vendor = await createTestUser('vendor');
      const restaurant = await createTestRestaurant(vendor._id);
      const menuItem = await createTestMenuItem(restaurant._id, {
        orderCount: 0
      });

      menuItem.orderCount += 1;
      await menuItem.save();

      expect(menuItem.orderCount).toBe(1);
    });
  });
});
