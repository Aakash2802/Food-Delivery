/**
 * Order API Integration Tests
 */

const request = require('supertest');
const app = require('../../app');
const { createTestUser, createTestRestaurant, createTestMenuItem, createTestOrder, generateTestToken } = require('../helpers/testHelpers');

describe('Order API Integration Tests', () => {
  describe('POST /api/orders', () => {
    it('should create order', async () => {
      const customer = await createTestUser('customer', { email: 'customer30@test.com' });
      const vendor = await createTestUser('vendor', { email: 'vendor30@test.com' });
      const restaurant = await createTestRestaurant(vendor._id, { isOpen: true });
      const menuItem = await createTestMenuItem(restaurant._id);
      const token = generateTestToken(customer._id, customer.role);

      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${token}`)
        .send({
          restaurantId: restaurant._id,
          items: [{
            menuItemId: menuItem._id,
            quantity: 2,
            customizations: []
          }],
          deliveryAddress: {
            street: '123 Test St',
            city: 'Test City',
            state: 'Test State',
            zipCode: '12345',
            location: {
              type: 'Point',
              coordinates: [77.5946, 12.9716]
            }
          },
          contactPhone: '+919876543210',
          paymentMethod: 'cod'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.order).toBeDefined();
    });
  });

  describe('GET /api/orders', () => {
    it('should get customer orders', async () => {
      const customer = await createTestUser('customer', { email: 'customer31@test.com' });
      const token = generateTestToken(customer._id, customer.role);

      const response = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
    });
  });

  describe('GET /api/orders/:orderId', () => {
    it('should get order details', async () => {
      const customer = await createTestUser('customer', { email: 'customer32@test.com' });
      const vendor = await createTestUser('vendor', { email: 'vendor31@test.com' });
      const restaurant = await createTestRestaurant(vendor._id);
      const menuItem = await createTestMenuItem(restaurant._id);
      const items = [{ menuItemId: menuItem._id, name: 'Item', price: 100, quantity: 1 }];
      const order = await createTestOrder(customer._id, restaurant._id, items);
      const token = generateTestToken(customer._id, customer.role);

      const response = await request(app)
        .get(`/api/orders/${order._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.data.order._id.toString()).toBe(order._id.toString());
    });
  });
});
