/**
 * User Model Unit Tests
 */

const User = require('../../../models/User');
const { createTestUser } = require('../../helpers/testHelpers');

describe('User Model', () => {
  describe('User Creation', () => {
    it('should create a customer user successfully', async () => {
      const user = await createTestUser('customer');

      expect(user.name).toBe('Test Customer');
      expect(user.email).toBe('test.customer@example.com');
      expect(user.role).toBe('customer');
      expect(user.isActive).toBe(true);
      expect(user.password).not.toBe('Password123!'); // Should be hashed
    });

    it('should create a vendor user successfully', async () => {
      const user = await createTestUser('vendor');

      expect(user.role).toBe('vendor');
      expect(user.email).toBe('test.vendor@example.com');
    });

    it('should create a driver user successfully', async () => {
      const user = await createTestUser('driver', {
        vehicleDetails: {
          type: 'bike',
          number: 'KA01AB1234',
          model: 'Honda'
        }
      });

      expect(user.role).toBe('driver');
      expect(user.vehicleDetails.type).toBe('bike');
      expect(user.vehicleDetails.number).toBe('KA01AB1234');
    });

    it('should hash password on save', async () => {
      const user = await createTestUser('customer');

      expect(user.password).toBeDefined();
      expect(user.password).not.toBe('Password123!');
      expect(user.password.length).toBeGreaterThan(20);
    });

    it('should fail without required fields', async () => {
      const user = new User({
        name: 'Test User'
        // Missing email, password, phone, role
      });

      await expect(user.save()).rejects.toThrow();
    });

    it('should fail with invalid email', async () => {
      const user = new User({
        name: 'Test User',
        email: 'invalid-email',
        password: 'Password123!',
        phone: '+919876543210',
        role: 'customer'
      });

      await expect(user.save()).rejects.toThrow();
    });

    it('should fail with duplicate email', async () => {
      await createTestUser('customer');

      const duplicateUser = new User({
        name: 'Another User',
        email: 'test.customer@example.com',
        password: 'Password123!',
        phone: '+919876543211',
        role: 'customer'
      });

      await expect(duplicateUser.save()).rejects.toThrow();
    });
  });

  describe('Password Methods', () => {
    it('should compare password correctly', async () => {
      const user = await createTestUser('customer');

      const isMatch = await user.comparePassword('Password123!');
      expect(isMatch).toBe(true);

      const isNotMatch = await user.comparePassword('WrongPassword');
      expect(isNotMatch).toBe(false);
    });

    it('should not rehash password if not modified', async () => {
      const user = await createTestUser('customer');
      const originalHash = user.password;

      user.name = 'Updated Name';
      await user.save();

      expect(user.password).toBe(originalHash);
    });
  });

  describe('Address Management', () => {
    it('should add address to user', async () => {
      const user = await createTestUser('customer');

      user.addresses.push({
        label: 'Home',
        street: '123 Test Street',
        city: 'Bangalore',
        state: 'Karnataka',
        zipCode: '560001',
        location: {
          type: 'Point',
          coordinates: [77.5946, 12.9716]
        },
        isDefault: true
      });

      await user.save();

      expect(user.addresses.length).toBe(1);
      expect(user.addresses[0].label).toBe('Home');
      expect(user.addresses[0].isDefault).toBe(true);
    });

    it('should only allow one default address', async () => {
      const user = await createTestUser('customer');

      user.addresses.push({
        label: 'Home',
        street: '123 Test Street',
        city: 'Bangalore',
        state: 'Karnataka',
        zipCode: '560001',
        location: {
          type: 'Point',
          coordinates: [77.5946, 12.9716]
        },
        isDefault: true
      });

      user.addresses.push({
        label: 'Work',
        street: '456 Work Street',
        city: 'Bangalore',
        state: 'Karnataka',
        zipCode: '560002',
        location: {
          type: 'Point',
          coordinates: [77.6000, 12.9800]
        },
        isDefault: true
      });

      await user.save();

      const defaultAddresses = user.addresses.filter(addr => addr.isDefault);
      expect(defaultAddresses.length).toBeLessThanOrEqual(1);
    });
  });

  describe('Driver-specific Features', () => {
    it('should allow location updates for driver', async () => {
      const driver = await createTestUser('driver', {
        vehicleDetails: {
          type: 'bike',
          number: 'KA01AB1234',
          model: 'Honda'
        }
      });

      driver.currentLocation = {
        type: 'Point',
        coordinates: [77.5946, 12.9716]
      };

      await driver.save();

      expect(driver.currentLocation.type).toBe('Point');
      expect(driver.currentLocation.coordinates).toEqual([77.5946, 12.9716]);
    });

    it('should track driver availability', async () => {
      const driver = await createTestUser('driver', {
        vehicleDetails: {
          type: 'bike',
          number: 'KA01AB1234',
          model: 'Honda'
        },
        isAvailable: true
      });

      expect(driver.isAvailable).toBe(true);

      driver.isAvailable = false;
      await driver.save();

      expect(driver.isAvailable).toBe(false);
    });
  });
});
