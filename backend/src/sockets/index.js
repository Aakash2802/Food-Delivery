/**
 * Socket.IO Server Implementation
 * Real-time features for order tracking and notifications
 */

const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
const config = require('../config/env');
const User = require('../models/User');

let io;

// Initialize Socket.IO
const initializeSocket = (server) => {
  io = socketIO(server, {
    cors: {
      origin: ['http://localhost:5173', 'http://localhost:5174', config.frontendUrl],
      methods: ['GET', 'POST'],
      credentials: true
    },
    pingTimeout: 60000,
    pingInterval: 25000
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = jwt.verify(token, config.jwt.secret);
      const user = await User.findById(decoded.userId).select('-password');

      if (!user || !user.isActive) {
        return next(new Error('Authentication error: Invalid user'));
      }

      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error: ' + error.message));
    }
  });

  // Connection handler
  io.on('connection', (socket) => {
    console.log(`✅ User connected: ${socket.user.name} (${socket.user.role}) - Socket ID: ${socket.id}`);

    // Join user-specific room
    socket.join(`user:${socket.user._id}`);

    // Join role-specific room
    socket.join(`role:${socket.user.role}`);

    // Customer events
    if (socket.user.role === 'customer') {
      handleCustomerEvents(socket);
    }

    // Vendor events
    if (socket.user.role === 'vendor') {
      handleVendorEvents(socket);
    }

    // Driver events
    if (socket.user.role === 'driver') {
      handleDriverEvents(socket);
    }

    // Admin events
    if (socket.user.role === 'admin') {
      handleAdminEvents(socket);
    }

    // Disconnect handler
    socket.on('disconnect', () => {
      console.log(`❌ User disconnected: ${socket.user.name} - Socket ID: ${socket.id}`);
    });
  });

  console.log('🔌 Socket.IO initialized');
  return io;
};

// Customer event handlers
const handleCustomerEvents = (socket) => {
  // Track specific order
  socket.on('order:track', (orderId) => {
    socket.join(`order:${orderId}`);
    console.log(`👀 Customer ${socket.user.name} tracking order: ${orderId}`);
  });

  // Stop tracking order
  socket.on('order:untrack', (orderId) => {
    socket.leave(`order:${orderId}`);
  });
};

// Vendor event handlers
const handleVendorEvents = (socket) => {
  // Join restaurant room
  socket.on('restaurant:join', (restaurantId) => {
    socket.join(`restaurant:${restaurantId}`);
    console.log(`🏪 Vendor ${socket.user.name} joined restaurant: ${restaurantId}`);
  });

  // Leave restaurant room
  socket.on('restaurant:leave', (restaurantId) => {
    socket.leave(`restaurant:${restaurantId}`);
  });

  // Update restaurant status
  socket.on('restaurant:status', ({ restaurantId, isOpen }) => {
    io.to(`restaurant:${restaurantId}`).emit('restaurant:statusUpdated', { isOpen });
  });
};

// Driver event handlers
const handleDriverEvents = (socket) => {
  // Update driver location
  socket.on('driver:location', async (data) => {
    const { latitude, longitude, orderId } = data;

    try {
      // Update driver location in database
      await User.findByIdAndUpdate(socket.user._id, {
        currentLocation: {
          type: 'Point',
          coordinates: [longitude, latitude]
        }
      });

      // Broadcast to order room if orderId provided
      if (orderId) {
        io.to(`order:${orderId}`).emit('driver:locationUpdated', {
          driverId: socket.user._id,
          location: { latitude, longitude },
          timestamp: new Date()
        });
      }
    } catch (error) {
      console.error('Error updating driver location:', error);
    }
  });

  // Update availability
  socket.on('driver:availability', async (isAvailable) => {
    try {
      await User.findByIdAndUpdate(socket.user._id, { isAvailable });
      io.to('role:admin').emit('driver:availabilityUpdated', {
        driverId: socket.user._id,
        isAvailable,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error updating driver availability:', error);
    }
  });
};

// Admin event handlers
const handleAdminEvents = (socket) => {
  // Join admin dashboard room
  socket.join('admin:dashboard');
  console.log(`👑 Admin ${socket.user.name} joined dashboard`);
};

// Emit order status update
const emitOrderStatusUpdate = (order) => {
  if (!io) return;

  const update = {
    orderId: order._id,
    orderNumber: order.orderNumber,
    status: order.status,
    timestamp: new Date()
  };

  // Emit to customer
  io.to(`user:${order.customerId}`).emit('order:statusUpdated', update);

  // Emit to restaurant/vendor
  io.to(`restaurant:${order.restaurantId}`).emit('order:statusUpdated', update);

  // Emit to driver if assigned
  if (order.driverId) {
    io.to(`user:${order.driverId}`).emit('order:statusUpdated', update);
  }

  // Emit to specific order room
  io.to(`order:${order._id}`).emit('order:statusUpdated', update);

  // Emit to admin
  io.to('role:admin').emit('order:statusUpdated', update);
};

// Emit new order notification
const emitNewOrder = (order) => {
  if (!io) return;

  const notification = {
    orderId: order._id,
    orderNumber: order.orderNumber,
    restaurantId: order.restaurantId,
    customerId: order.customerId,
    total: order.pricing.total,
    timestamp: new Date()
  };

  // Notify restaurant/vendor
  io.to(`restaurant:${order.restaurantId}`).emit('order:new', notification);

  // Notify admins
  io.to('role:admin').emit('order:new', notification);
};

// Emit driver assigned notification
const emitDriverAssigned = (order, driver) => {
  if (!io) return;

  const notification = {
    orderId: order._id,
    orderNumber: order.orderNumber,
    driver: {
      id: driver._id,
      name: driver.name,
      phone: driver.phone,
      vehicle: driver.vehicle
    },
    timestamp: new Date()
  };

  // Notify customer
  io.to(`user:${order.customerId}`).emit('driver:assigned', notification);

  // Notify driver
  io.to(`user:${driver._id}`).emit('order:assigned', {
    ...notification,
    restaurantId: order.restaurantId,
    deliveryAddress: order.deliveryAddress
  });

  // Notify order room
  io.to(`order:${order._id}`).emit('driver:assigned', notification);
};

// Emit payment completed
const emitPaymentCompleted = (order) => {
  if (!io) return;

  const notification = {
    orderId: order._id,
    orderNumber: order.orderNumber,
    amount: order.pricing.total,
    timestamp: new Date()
  };

  // Notify customer
  io.to(`user:${order.customerId}`).emit('payment:completed', notification);

  // Notify restaurant
  io.to(`restaurant:${order.restaurantId}`).emit('payment:completed', notification);
};

// Get Socket.IO instance
const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
};

module.exports = {
  initializeSocket,
  emitOrderStatusUpdate,
  emitNewOrder,
  emitDriverAssigned,
  emitPaymentCompleted,
  getIO
};
