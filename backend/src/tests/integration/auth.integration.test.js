/**
 * Auth API Integration Tests
 */

const request = require('supertest');
const app = require('../../app');
const User = require('../../models/User');
const { createTestUser, generateTestToken } = require('../helpers/testHelpers');

describe('Auth API Integration Tests', () => {
  describe('POST /api/auth/signup', () => {
    it('should register a new customer', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          name: 'John Doe',
          email: 'john@example.com',
          password: 'Password123!',
          phone: '+919876543210',
          role: 'customer'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe('john@example.com');
      expect(response.body.data.tokens.accessToken).toBeDefined();
    });

    it('should fail with duplicate email', async () => {
      await createTestUser('customer');

      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          name: 'Another User',
          email: 'test.customer@example.com',
          password: 'Password123!',
          phone: '+919876543211',
          role: 'customer'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should fail with invalid email format', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          name: 'John Doe',
          email: 'invalid-email',
          password: 'Password123!',
          phone: '+919876543210',
          role: 'customer'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should fail with missing required fields', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          name: 'John Doe',
          email: 'john@example.com'
          // Missing password, phone, role
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await createTestUser('customer');
    });

    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test.customer@example.com',
          password: 'Password123!'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe('test.customer@example.com');
      expect(response.body.data.tokens.accessToken).toBeDefined();
      expect(response.body.data.tokens.refreshToken).toBeDefined();
    });

    it('should fail with incorrect password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test.customer@example.com',
          password: 'WrongPassword123!'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid email or password');
    });

    it('should fail with non-existent email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'Password123!'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should fail with inactive user', async () => {
      const inactiveUser = await createTestUser('customer', {
        email: 'inactive@example.com',
        isActive: false
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'inactive@example.com',
          password: 'Password123!'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/auth/profile', () => {
    it('should get user profile with valid token', async () => {
      const user = await createTestUser('customer');
      const token = generateTestToken(user._id, user.role);

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(user.email);
    });

    it('should fail without token', async () => {
      const response = await request(app)
        .get('/api/auth/me');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/auth/profile', () => {
    it('should update user profile', async () => {
      const user = await createTestUser('customer');
      const token = generateTestToken(user._id, user.role);

      const response = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Updated Name',
          phone: '+919876543299'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.name).toBe('Updated Name');
    });

    it('should not allow email update', async () => {
      const user = await createTestUser('customer');
      const token = generateTestToken(user._id, user.role);

      const response = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({
          email: 'newemail@example.com'
        });

      expect(response.status).toBe(200);
      // Email should remain unchanged
      const updatedUser = await User.findById(user._id);
      expect(updatedUser.email).toBe(user.email);
    });
  });

  describe('POST /api/auth/address', () => {
    it('should add a new address', async () => {
      const user = await createTestUser('customer');
      const token = generateTestToken(user._id, user.role);

      const response = await request(app)
        .post('/api/auth/addresses')
        .set('Authorization', `Bearer ${token}`)
        .send({
          label: 'Home',
          street: '123 Test Street',
          city: 'Bangalore',
          state: 'Karnataka',
          zipCode: '560001',
          coordinates: [77.5946, 12.9716],
          isDefault: true
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Address added successfully');
    });

    it('should fail with invalid coordinates', async () => {
      const user = await createTestUser('customer');
      const token = generateTestToken(user._id, user.role);

      const response = await request(app)
        .post('/api/auth/addresses')
        .set('Authorization', `Bearer ${token}`)
        .send({
          label: 'Home',
          street: '123 Test Street',
          city: 'Bangalore',
          state: 'Karnataka',
          zipCode: '560001',
          coordinates: [200, 100] // Invalid coordinates
        });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/auth/change-password', () => {
    it('should change password with correct current password', async () => {
      const user = await createTestUser('customer');
      const token = generateTestToken(user._id, user.role);

      const response = await request(app)
        .put('/api/auth/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: 'Password123!',
          newPassword: 'NewPassword456!'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verify new password works
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: user.email,
          password: 'NewPassword456!'
        });

      expect(loginResponse.status).toBe(200);
    });

    it('should fail with incorrect current password', async () => {
      const user = await createTestUser('customer');
      const token = generateTestToken(user._id, user.role);

      const response = await request(app)
        .put('/api/auth/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: 'WrongPassword!',
          newPassword: 'NewPassword456!'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout and invalidate refresh token', async () => {
      const user = await createTestUser('customer');
      const token = generateTestToken(user._id, user.role);

      // First login to get refresh token
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: user.email,
          password: 'Password123!'
        });

      const refreshToken = loginResponse.body.data.tokens.refreshToken;

      // Logout
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`)
        .send({ refreshToken });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
});
