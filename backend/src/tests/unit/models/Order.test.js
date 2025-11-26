/**
 * Order Model Unit Tests
 */

const Order = require('../../../models/Order');
const { createTestUser, createTestRestaurant, createTestMenuItem, createTestOrder } = require('../../helpers/testHelpers');

describe('Order Model', () => {
  describe('Order Creation', () => {
    it('should create an order successfully', async () => {
      const customer = await createTestUser('customer');
      const vendor = await createTestUser('vendor', { email: 'vendor@test.com' });
      const restaurant = await createTestRestaurant(vendor._id);
      const menuItem = await createTestMenuItem(restaurant._id);

      const items = [{
        menuItemId: menuItem._id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: 2
      }];

      const order = await createTestOrder(customer._id, restaurant._id, items);

      expect(order.customerId.toString()).toBe(customer._id.toString());
      expect(order.restaurantId.toString()).toBe(restaurant._id.toString());
      expect(order.status).toBe('pending');
    });

    it('should generate unique order number', async () => {
      const customer = await createTestUser('customer');
      const vendor = await createTestUser('vendor', { email: 'vendor2@test.com' });
      const restaurant = await createTestRestaurant(vendor._id);
      const menuItem = await createTestMenuItem(restaurant._id);

      const items = [{ menuItemId: menuItem._id, name: 'Item', price: 100, quantity: 1 }];

      const order1 = await createTestOrder(customer._id, restaurant._id, items);
      const order2 = await createTestOrder(customer._id, restaurant._id, items);

      expect(order1.orderNumber).toBeDefined();
      expect(order2.orderNumber).toBeDefined();
      expect(order1.orderNumber).not.toBe(order2.orderNumber);
    });

    it('should fail without required fields', async () => {
      const order = new Order({
        status: 'pending'
        // Missing customerId, restaurantId, items, deliveryAddress
      });

      await expect(order.save()).rejects.toThrow();
    });
  });

  describe('Order Status Workflow', () => {
    it('should start with pending status', async () => {
      const customer = await createTestUser('customer');
      const vendor = await createTestUser('vendor', { email: 'vendor3@test.com' });
      const restaurant = await createTestRestaurant(vendor._id);
      const menuItem = await createTestMenuItem(restaurant._id);
      const items = [{ menuItemId: menuItem._id, name: 'Item', price: 100, quantity: 1 }];

      const order = await createTestOrder(customer._id, restaurant._id, items);

      expect(order.status).toBe('pending');
    });

    it('should track status history', async () => {
      const customer = await createTestUser('customer');
      const vendor = await createTestUser('vendor', { email: 'vendor4@test.com' });
      const restaurant = await createTestRestaurant(vendor._id);
      const menuItem = await createTestMenuItem(restaurant._id);
      const items = [{ menuItemId: menuItem._id, name: 'Item', price: 100, quantity: 1 }];

      const order = await createTestOrder(customer._id, restaurant._id, items);

      order.status = 'confirmed';
      await order.save();

      order.status = 'preparing';
      await order.save();

      expect(order.statusHistory.length).toBeGreaterThanOrEqual(2);
    });

    it('should allow valid status transitions', async () => {
      const customer = await createTestUser('customer');
      const vendor = await createTestUser('vendor', { email: 'vendor5@test.com' });
      const restaurant = await createTestRestaurant(vendor._id);
      const menuItem = await createTestMenuItem(restaurant._id);
      const items = [{ menuItemId: menuItem._id, name: 'Item', price: 100, quantity: 1 }];

      const order = await createTestOrder(customer._id, restaurant._id, items);

      const validStatuses = ['confirmed', 'preparing', 'ready', 'assigned', 'picked', 'en_route', 'delivered'];

      for (const status of validStatuses) {
        order.status = status;
        await order.save();
        expect(order.status).toBe(status);
      }
    });
  });

  describe('Pricing Calculations', () => {
    it('should calculate subtotal correctly', async () => {
      const customer = await createTestUser('customer');
      const vendor = await createTestUser('vendor', { email: 'vendor6@test.com' });
      const restaurant = await createTestRestaurant(vendor._id);
      const menuItem = await createTestMenuItem(restaurant._id, { price: 100 });

      const items = [{
        menuItemId: menuItem._id,
        name: 'Item',
        price: 100,
        quantity: 3
      }];

      const order = await createTestOrder(customer._id, restaurant._id, items, {
        pricing: {
          subtotal: 300,
          deliveryFee: 40,
          taxes: 30.6,
          discount: 0,
          platformFee: 5,
          total: 375.6
        }
      });

      expect(order.pricing.subtotal).toBe(300);
    });

    it('should include delivery fee', async () => {
      const customer = await createTestUser('customer');
      const vendor = await createTestUser('vendor', { email: 'vendor7@test.com' });
      const restaurant = await createTestRestaurant(vendor._id);
      const menuItem = await createTestMenuItem(restaurant._id);
      const items = [{ menuItemId: menuItem._id, name: 'Item', price: 100, quantity: 1 }];

      const order = await createTestOrder(customer._id, restaurant._id, items, {
        pricing: {
          subtotal: 100,
          deliveryFee: 40,
          taxes: 12.6,
          discount: 0,
          platformFee: 5,
          total: 157.6
        }
      });

      expect(order.pricing.deliveryFee).toBe(40);
    });

    it('should calculate taxes', async () => {
      const customer = await createTestUser('customer');
      const vendor = await createTestUser('vendor', { email: 'vendor8@test.com' });
      const restaurant = await createTestRestaurant(vendor._id);
      const menuItem = await createTestMenuItem(restaurant._id);
      const items = [{ menuItemId: menuItem._id, name: 'Item', price: 100, quantity: 1 }];

      const order = await createTestOrder(customer._id, restaurant._id, items);

      expect(order.pricing.taxes).toBeGreaterThan(0);
    });

    it('should apply discount', async () => {
      const customer = await createTestUser('customer');
      const vendor = await createTestUser('vendor', { email: 'vendor9@test.com' });
      const restaurant = await createTestRestaurant(vendor._id);
      const menuItem = await createTestMenuItem(restaurant._id);
      const items = [{ menuItemId: menuItem._id, name: 'Item', price: 100, quantity: 1 }];

      const order = await createTestOrder(customer._id, restaurant._id, items, {
        pricing: {
          subtotal: 100,
          deliveryFee: 40,
          taxes: 12.6,
          discount: 20,
          platformFee: 5,
          total: 137.6
        }
      });

      expect(order.pricing.discount).toBe(20);
      expect(order.pricing.total).toBeLessThan(order.pricing.subtotal + order.pricing.deliveryFee);
    });
  });

  describe('Payment Information', () => {
    it('should track payment status', async () => {
      const customer = await createTestUser('customer');
      const vendor = await createTestUser('vendor', { email: 'vendor10@test.com' });
      const restaurant = await createTestRestaurant(vendor._id);
      const menuItem = await createTestMenuItem(restaurant._id);
      const items = [{ menuItemId: menuItem._id, name: 'Item', price: 100, quantity: 1 }];

      const order = await createTestOrder(customer._id, restaurant._id, items);

      expect(order.paymentInfo.status).toBe('pending');

      order.paymentInfo.status = 'completed';
      order.paymentInfo.transactionId = 'txn_123';
      await order.save();

      expect(order.paymentInfo.status).toBe('completed');
      expect(order.paymentInfo.transactionId).toBe('txn_123');
    });

    it('should support different payment methods', async () => {
      const customer = await createTestUser('customer');
      const vendor = await createTestUser('vendor', { email: 'vendor11@test.com' });
      const restaurant = await createTestRestaurant(vendor._id);
      const menuItem = await createTestMenuItem(restaurant._id);
      const items = [{ menuItemId: menuItem._id, name: 'Item', price: 100, quantity: 1 }];

      const order = await createTestOrder(customer._id, restaurant._id, items, {
        paymentInfo: { method: 'cod', status: 'pending' }
      });

      expect(order.paymentInfo.method).toBe('cod');
    });
  });

  describe('Delivery Information', () => {
    it('should store delivery address', async () => {
      const customer = await createTestUser('customer');
      const vendor = await createTestUser('vendor', { email: 'vendor12@test.com' });
      const restaurant = await createTestRestaurant(vendor._id);
      const menuItem = await createTestMenuItem(restaurant._id);
      const items = [{ menuItemId: menuItem._id, name: 'Item', price: 100, quantity: 1 }];

      const order = await createTestOrder(customer._id, restaurant._id, items);

      expect(order.deliveryAddress.street).toBeDefined();
      expect(order.deliveryAddress.city).toBeDefined();
    });

    it('should estimate delivery time', async () => {
      const customer = await createTestUser('customer');
      const vendor = await createTestUser('vendor', { email: 'vendor13@test.com' });
      const restaurant = await createTestRestaurant(vendor._id);
      const menuItem = await createTestMenuItem(restaurant._id);
      const items = [{ menuItemId: menuItem._id, name: 'Item', price: 100, quantity: 1 }];

      const order = await createTestOrder(customer._id, restaurant._id, items);

      // Calculate delivery time using the model method
      order.calculateDeliveryTime(20, 15); // 20 min prep + 15 min travel

      expect(order.estimatedDeliveryTime).toBeDefined();
      expect(order.estimatedDeliveryTime).toBeInstanceOf(Date);
    });
  });

  describe('Driver Assignment', () => {
    it('should assign driver to order', async () => {
      const customer = await createTestUser('customer');
      const vendor = await createTestUser('vendor', { email: 'vendor14@test.com' });
      const driver = await createTestUser('driver', {
        email: 'driver@test.com',
        vehicleDetails: {
          type: 'bike',
          number: 'KA01AB1234',
          model: 'Honda'
        }
      });
      const restaurant = await createTestRestaurant(vendor._id);
      const menuItem = await createTestMenuItem(restaurant._id);
      const items = [{ menuItemId: menuItem._id, name: 'Item', price: 100, quantity: 1 }];

      const order = await createTestOrder(customer._id, restaurant._id, items);

      order.driverId = driver._id;
      order.status = 'assigned';
      await order.save();

      expect(order.driverId.toString()).toBe(driver._id.toString());
      expect(order.status).toBe('assigned');
    });
  });

  describe('Commission Tracking', () => {
    it('should calculate platform commission', async () => {
      const customer = await createTestUser('customer');
      const vendor = await createTestUser('vendor', { email: 'vendor15@test.com' });
      const restaurant = await createTestRestaurant(vendor._id);
      const menuItem = await createTestMenuItem(restaurant._id);
      const items = [{ menuItemId: menuItem._id, name: 'Item', price: 100, quantity: 1 }];

      const order = await createTestOrder(customer._id, restaurant._id, items, {
        commission: { rate: 15, amount: 15 }
      });

      expect(order.commission.rate).toBe(15);
      expect(order.commission.amount).toBe(15);
    });
  });
});
