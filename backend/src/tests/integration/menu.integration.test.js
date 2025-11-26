/**
 * Menu API Integration Tests
 */

const request = require('supertest');
const app = require('../../app');
const { createTestUser, createTestRestaurant, createTestMenuItem, generateTestToken } = require('../helpers/testHelpers');

describe('Menu API Integration Tests', () => {
  describe('GET /api/menu/:restaurantId', () => {
    it('should get restaurant menu', async () => {
      const vendor = await createTestUser('vendor');
      const restaurant = await createTestRestaurant(vendor._id);
      await createTestMenuItem(restaurant._id, { name: 'Pizza', category: 'Main Course' });
      await createTestMenuItem(restaurant._id, { name: 'Pasta', category: 'Main Course' });

      const response = await request(app)
        .get(`/api/menu/restaurants/${restaurant._id}/menu`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.menuItems).toBeInstanceOf(Array);
    });

    it('should return 404 for non-existent restaurant', async () => {
      const fakeId = '507f1f77bcf86cd799439011';

      const response = await request(app)
        .get(`/api/menu/restaurants/${fakeId}/menu`);

      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/menu (Vendor)', () => {
    it('should create menu item as vendor', async () => {
      const vendor = await createTestUser('vendor', { email: 'vendor20@test.com' });
      const restaurant = await createTestRestaurant(vendor._id);

      // Update vendor with restaurantId
      vendor.restaurantId = restaurant._id;
      await vendor.save();

      const token = generateTestToken(vendor._id, vendor.role, restaurant._id);

      const response = await request(app)
        .post('/api/menu/vendor/menu')
        .set('Authorization', `Bearer ${token}`)
        .send({
          restaurantId: restaurant._id,
          name: 'Burger',
          description: 'Delicious burger',
          price: 150,
          category: 'Fast Food',
          isVeg: false,
          isAvailable: true
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.menuItem.name).toBe('Burger');
    });

    it('should fail without vendor role', async () => {
      const customer = await createTestUser('customer', { email: 'customer20@test.com' });
      const vendor = await createTestUser('vendor', { email: 'vendor21@test.com' });
      const restaurant = await createTestRestaurant(vendor._id);
      const token = generateTestToken(customer._id, customer.role);

      const response = await request(app)
        .post('/api/menu/vendor/menu')
        .set('Authorization', `Bearer ${token}`)
        .send({
          restaurantId: restaurant._id,
          name: 'Item',
          price: 100,
          category: 'Test'
        });

      expect(response.status).toBe(403);
    });
  });

  describe('PUT /api/menu/:itemId (Vendor)', () => {
    it('should update own menu item', async () => {
      const vendor = await createTestUser('vendor', { email: 'vendor22@test.com' });
      const restaurant = await createTestRestaurant(vendor._id);
      const menuItem = await createTestMenuItem(restaurant._id);

      // Update vendor with restaurantId
      vendor.restaurantId = restaurant._id;
      await vendor.save();

      const token = generateTestToken(vendor._id, vendor.role, restaurant._id);

      const response = await request(app)
        .put(`/api/menu/vendor/menu/${menuItem._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Updated Item',
          price: 200
        });

      expect(response.status).toBe(200);
      expect(response.body.data.menuItem.name).toBe('Updated Item');
    });
  });

  describe('DELETE /api/menu/:itemId (Vendor)', () => {
    it('should delete own menu item', async () => {
      const vendor = await createTestUser('vendor', { email: 'vendor23@test.com' });
      const restaurant = await createTestRestaurant(vendor._id);
      const menuItem = await createTestMenuItem(restaurant._id);

      // Update vendor with restaurantId
      vendor.restaurantId = restaurant._id;
      await vendor.save();

      const token = generateTestToken(vendor._id, vendor.role, restaurant._id);

      const response = await request(app)
        .delete(`/api/menu/vendor/menu/${menuItem._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
});
