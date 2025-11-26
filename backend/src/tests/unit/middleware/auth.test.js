/**
 * Auth Middleware Unit Tests
 */

const { authMiddleware, optionalAuth } = require('../../../middleware/auth.middleware');
const { createTestUser, generateTestToken, mockRequest, mockResponse, mockNext } = require('../../helpers/testHelpers');
const jwt = require('jsonwebtoken');

describe('Auth Middleware', () => {
  describe('authMiddleware', () => {
    it('should authenticate valid token', async () => {
      const user = await createTestUser('customer');
      const token = generateTestToken(user._id, user.role);

      const req = mockRequest({
        headers: {
          authorization: `Bearer ${token}`
        }
      });
      const res = mockResponse();
      const next = mockNext();

      await authMiddleware(req, res, next);

      expect(req.user).toBeDefined();
      expect(req.user.email).toBe(user.email);
      expect(next).toHaveBeenCalled();
    });

    it('should reject missing token', async () => {
      const req = mockRequest();
      const res = mockResponse();
      const next = mockNext();

      await authMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Access denied. No token provided.'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject invalid token format', async () => {
      const req = mockRequest({
        headers: {
          authorization: 'InvalidFormat token123'
        }
      });
      const res = mockResponse();
      const next = mockNext();

      await authMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject expired token', async () => {
      const user = await createTestUser('customer');
      const expiredToken = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.JWT_SECRET || 'test-secret-key',
        { expiresIn: '-1h' }
      );

      const req = mockRequest({
        headers: {
          authorization: `Bearer ${expiredToken}`
        }
      });
      const res = mockResponse();
      const next = mockNext();

      await authMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject token with invalid user', async () => {
      const fakeUserId = '507f1f77bcf86cd799439011';
      const token = generateTestToken(fakeUserId, 'customer');

      const req = mockRequest({
        headers: {
          authorization: `Bearer ${token}`
        }
      });
      const res = mockResponse();
      const next = mockNext();

      await authMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'User not found. Token is invalid.'
      });
    });

    it('should reject inactive user', async () => {
      const user = await createTestUser('customer', { isActive: false });
      const token = generateTestToken(user._id, user.role);

      const req = mockRequest({
        headers: {
          authorization: `Bearer ${token}`
        }
      });
      const res = mockResponse();
      const next = mockNext();

      await authMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'User account is inactive.'
      });
    });
  });

  describe('optionalAuth', () => {
    it('should attach user if token is valid', async () => {
      const user = await createTestUser('customer');
      const token = generateTestToken(user._id, user.role);

      const req = mockRequest({
        headers: {
          authorization: `Bearer ${token}`
        }
      });
      const res = mockResponse();
      const next = mockNext();

      await optionalAuth(req, res, next);

      expect(req.user).toBeDefined();
      expect(req.user.email).toBe(user.email);
      expect(next).toHaveBeenCalled();
    });

    it('should continue without user if no token', async () => {
      const req = mockRequest();
      const res = mockResponse();
      const next = mockNext();

      await optionalAuth(req, res, next);

      expect(req.user).toBeNull();
      expect(next).toHaveBeenCalled();
    });

    it('should continue without user if token is invalid', async () => {
      const req = mockRequest({
        headers: {
          authorization: 'Bearer invalid-token'
        }
      });
      const res = mockResponse();
      const next = mockNext();

      await optionalAuth(req, res, next);

      expect(req.user).toBeNull();
      expect(next).toHaveBeenCalled();
    });
  });
});
