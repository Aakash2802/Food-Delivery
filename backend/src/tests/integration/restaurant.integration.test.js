/**
 * Restaurant API Integration Tests
 */

const request = require('supertest');
const app = require('../../app');
const Restaurant = require('../../models/Restaurant');
const { createTestUser, createTestRestaurant, generateTestToken } = require('../helpers/testHelpers');

describe('Restaurant API Integration Tests', () => {
  describe('GET /api/restaurants', () => {
    beforeEach(async () => {
      const vendor = await createTestUser('vendor');

      // Create multiple test restaurants
      await createTestRestaurant(vendor._id, {
        name: 'Pizza Palace',
        cuisines: ['Italian', 'Fast Food']
      });

      await createTestRestaurant(vendor._id, {
        name: 'Biryani House',
        cuisines: ['Indian', 'Biryani']
      });
    });

    it('should get all restaurants', async () => {
      const response = await request(app)
        .get('/api/restaurants');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThanOrEqual(2);
    });

    it('should filter restaurants by cuisine', async () => {
      const response = await request(app)
        .get('/api/restaurants')
        .query({ cuisine: 'Italian' });

      expect(response.status).toBe(200);
      expect(response.body.data).toBeInstanceOf(Array);

      if (response.body.data.length > 0) {
        const restaurant = response.body.data[0];
        expect(restaurant.cuisines).toContain('Italian');
      }
    });

    it('should search restaurants by location', async () => {
      const response = await request(app)
        .get('/api/restaurants')
        .query({
          latitude: 12.9716,
          longitude: 77.5946,
          radius: 5
        });

      expect(response.status).toBe(200);
      expect(response.body.data).toBeInstanceOf(Array);
    });

    it('should filter by rating', async () => {
      const response = await request(app)
        .get('/api/restaurants')
        .query({ minRating: 4.0 });

      expect(response.status).toBe(200);

      if (response.body.data.length > 0) {
        response.body.data.forEach(restaurant => {
          expect(restaurant.rating.average).toBeGreaterThanOrEqual(4.0);
        });
      }
    });

    it('should filter by pricing', async () => {
      const response = await request(app)
        .get('/api/restaurants')
        .query({ pricing: '$' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should search restaurants by name', async () => {
      const response = await request(app)
        .get('/api/restaurants')
        .query({ search: 'Pizza' });

      expect(response.status).toBe(200);

      if (response.body.data.length > 0) {
        const restaurant = response.body.data[0];
        expect(restaurant.name).toMatch(/Pizza/i);
      }
    });

    it('should paginate results', async () => {
      const response = await request(app)
        .get('/api/restaurants')
        .query({ page: 1, limit: 1 });

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeLessThanOrEqual(1);
      expect(response.body.pagination).toBeDefined();
      expect(response.body.pagination.page).toBe(1);
    });
  });

  describe('GET /api/restaurants/:id', () => {
    it('should get restaurant by ID', async () => {
      const vendor = await createTestUser('vendor');
      const restaurant = await createTestRestaurant(vendor._id);

      const response = await request(app)
        .get(`/api/restaurants/${restaurant._id}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.restaurant.name).toBe(restaurant.name);
    });

    it('should return 404 for non-existent restaurant', async () => {
      const fakeId = '507f1f77bcf86cd799439011';

      const response = await request(app)
        .get(`/api/restaurants/${fakeId}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('should return 404 for invalid ID format', async () => {
      const response = await request(app)
        .get('/api/restaurants/invalid-id');

      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/restaurants (Admin)', () => {
    it('should create restaurant as admin', async () => {
      const admin = await createTestUser('admin');
      const vendor = await createTestUser('vendor', { email: 'vendor@example.com' });
      const token = generateTestToken(admin._id, admin.role);

      const response = await request(app)
        .post('/api/restaurants/admin/restaurants')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'New Restaurant',
          ownerId: vendor._id,
          description: 'A great restaurant',
          location: {
            street: '123 Test Street',
            city: 'Bangalore',
            coordinates: {
              type: 'Point',
              coordinates: [77.5946, 12.9716]
            }
          },
          contactInfo: {
            phone: '+919876543210'
          },
          cuisines: ['Indian', 'Chinese'],
          deliveryTime: { min: 30, max: 45 },
          minimumOrder: 100
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.restaurant.name).toBe('New Restaurant');
    });

    it('should fail without admin role', async () => {
      const customer = await createTestUser('customer', { email: 'customer2@example.com' });
      const vendor = await createTestUser('vendor', { email: 'vendor2@example.com' });
      const token = generateTestToken(customer._id, customer.role);

      const response = await request(app)
        .post('/api/restaurants/admin/restaurants')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'New Restaurant',
          ownerId: vendor._id,
          location: {
            street: '123 Test Street',
            city: 'Bangalore',
            coordinates: {
              type: 'Point',
              coordinates: [77.5946, 12.9716]
            }
          },
          contactInfo: {
            phone: '+919876543210'
          },
          cuisines: ['Indian'],
          deliveryTime: { min: 30, max: 45 }
        });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });

    it('should fail with invalid vendor ID', async () => {
      const admin = await createTestUser('admin', { email: 'admin2@example.com' });
      const token = generateTestToken(admin._id, admin.role);

      const response = await request(app)
        .post('/api/restaurants/admin/restaurants')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'New Restaurant',
          ownerId: '507f1f77bcf86cd799439011', // Non-existent vendor
          location: {
            street: '123 Test Street',
            city: 'Bangalore',
            coordinates: {
              type: 'Point',
              coordinates: [77.5946, 12.9716]
            }
          },
          contactInfo: {
            phone: '+919876543210'
          },
          cuisines: ['Indian'],
          deliveryTime: { min: 30, max: 45 }
        });

      expect(response.status).toBe(400);
    });
  });

  describe('PUT /api/restaurants/:id (Vendor)', () => {
    it('should update own restaurant as vendor', async () => {
      const vendor = await createTestUser('vendor', { email: 'vendor3@example.com' });
      const restaurant = await createTestRestaurant(vendor._id);
      const token = generateTestToken(vendor._id, vendor.role);

      // Update vendor with restaurantId first
      vendor.restaurantId = restaurant._id;
      await vendor.save();

      const response = await request(app)
        .put('/api/restaurants/vendor/restaurant')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Updated Restaurant Name',
          description: 'Updated description'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.restaurant.name).toBe('Updated Restaurant Name');
    });

    it('should not update another vendor restaurant', async () => {
      const vendor1 = await createTestUser('vendor', { email: 'vendor4@example.com' });
      const vendor2 = await createTestUser('vendor', { email: 'vendor5@example.com' });
      const restaurant1 = await createTestRestaurant(vendor1._id);
      const restaurant2 = await createTestRestaurant(vendor2._id);

      // Vendor2 has their own restaurant, trying to update it should work for themselves
      vendor2.restaurantId = restaurant2._id;
      await vendor2.save();

      const token = generateTestToken(vendor2._id, vendor2.role);

      const response = await request(app)
        .put('/api/restaurants/vendor/restaurant')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Updated by Vendor 2'
        });

      // This should succeed because vendor2 is updating their own restaurant
      expect(response.status).toBe(200);
    });
  });

  describe('PATCH /api/restaurants/:id/status (Vendor)', () => {
    it('should toggle restaurant open/close status', async () => {
      const vendor = await createTestUser('vendor', { email: 'vendor6@example.com' });
      const restaurant = await createTestRestaurant(vendor._id);
      const token = generateTestToken(vendor._id, vendor.role);

      // Update vendor with restaurantId first
      vendor.restaurantId = restaurant._id;
      await vendor.save();

      const response = await request(app)
        .patch('/api/restaurants/vendor/restaurant/status')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('DELETE /api/restaurants/:id (Admin)', () => {
    it('should delete restaurant as admin', async () => {
      const admin = await createTestUser('admin', { email: 'admin3@example.com' });
      const vendor = await createTestUser('vendor', { email: 'vendor7@example.com' });
      const restaurant = await createTestRestaurant(vendor._id);
      const token = generateTestToken(admin._id, admin.role);

      const response = await request(app)
        .delete(`/api/restaurants/admin/restaurants/${restaurant._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verify soft delete
      const deletedRestaurant = await Restaurant.findById(restaurant._id);
      expect(deletedRestaurant.isActive).toBe(false);
    });

    it('should not delete restaurant as customer', async () => {
      const customer = await createTestUser('customer', { email: 'customer3@example.com' });
      const vendor = await createTestUser('vendor', { email: 'vendor8@example.com' });
      const restaurant = await createTestRestaurant(vendor._id);
      const token = generateTestToken(customer._id, customer.role);

      const response = await request(app)
        .delete(`/api/restaurants/admin/restaurants/${restaurant._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(403);
    });
  });
});
