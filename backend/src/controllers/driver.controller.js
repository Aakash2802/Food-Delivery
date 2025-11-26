const User = require('../models/User');
const Order = require('../models/Order');
const { asyncHandler } = require('../middleware/error.middleware');
const { paginate, buildPaginationResponse } = require('../utils/helpers');

/**
 * @desc    Update driver location
 * @route   PATCH /api/driver/location
 * @access  Private (Driver)
 */
exports.updateLocation = asyncHandler(async (req, res) => {
  const { latitude, longitude } = req.body;

  req.user.currentLocation = {
    type: 'Point',
    coordinates: [longitude, latitude],
    updatedAt: new Date()
  };

  await req.user.save();

  // Emit socket event for live tracking
  // io.to(`driver_${req.user._id}`).emit('driver:location_changed', {
  //   driverId: req.user._id,
  //   location: req.user.currentLocation,
  //   updatedAt: req.user.currentLocation.updatedAt
  // });

  // Also emit to active orders
  const activeOrders = await Order.find({
    driverId: req.user._id,
    status: { $in: ['picked', 'en_route'] }
  }).select('_id');

  // activeOrders.forEach(order => {
  //   io.to(`order_${order._id}`).emit('driver:location_changed', {
  //     orderId: order._id,
  //     location: req.user.currentLocation
  //   });
  // });

  res.status(200).json({
    success: true,
    message: 'Location updated successfully',
    data: {
      location: {
        latitude,
        longitude,
        updatedAt: req.user.currentLocation.updatedAt
      }
    }
  });
});

/**
 * @desc    Toggle driver availability
 * @route   PATCH /api/driver/availability
 * @access  Private (Driver)
 */
exports.toggleAvailability = asyncHandler(async (req, res) => {
  const { isAvailable } = req.body;

  req.user.isAvailable = isAvailable !== undefined ? isAvailable : !req.user.isAvailable;
  await req.user.save();

  // Emit socket event
  // if (req.user.isAvailable) {
  //   io.to('admin').emit('platform:driver_online', {
  //     driverId: req.user._id,
  //     name: req.user.name,
  //     location: req.user.currentLocation
  //   });
  // } else {
  //   io.to('admin').emit('platform:driver_offline', {
  //     driverId: req.user._id
  //   });
  // }

  res.status(200).json({
    success: true,
    message: `You are now ${req.user.isAvailable ? 'available' : 'unavailable'}`,
    data: {
      isAvailable: req.user.isAvailable
    }
  });
});

/**
 * @desc    Get driver's assigned orders
 * @route   GET /api/driver/orders
 * @access  Private (Driver)
 */
exports.getAssignedOrders = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;

  // Build query to show:
  // 1. Orders ready for pickup (status='ready' with no driver)
  // 2. All orders assigned to this driver (including delivered)
  const query = {
    $or: [
      { status: 'ready', driverId: null }, // Available orders
      { driverId: req.user._id } // All orders assigned to this driver
    ]
  };

  // Filter by status
  if (status) {
    query.status = status;
    delete query.$or; // If filtering by specific status, just use that
    if (status !== 'ready') {
      query.driverId = req.user._id; // For non-ready statuses, must be assigned to driver
    }
  }

  const total = await Order.countDocuments(query);

  let ordersQuery = Order.find(query)
    .sort({ createdAt: -1 })
    .populate('customerId', 'name phone')
    .populate('restaurantId', 'name address contactNumber')
    .populate('items.menuItemId', 'name');

  ordersQuery = paginate(ordersQuery, page, limit);

  const orders = await ordersQuery;

  res.status(200).json({
    success: true,
    ...buildPaginationResponse(orders, page, limit, total)
  });
});

/**
 * @desc    Get driver earnings
 * @route   GET /api/driver/earnings
 * @access  Private (Driver)
 */
exports.getEarnings = asyncHandler(async (req, res) => {
  const { startDate, endDate, period = 'today' } = req.query;

  let dateFilter = {};

  // Set date range based on period
  const now = new Date();
  switch (period) {
    case 'today':
      dateFilter = {
        $gte: new Date(now.setHours(0, 0, 0, 0)),
        $lte: new Date(now.setHours(23, 59, 59, 999))
      };
      break;
    case 'week':
      const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
      dateFilter = {
        $gte: new Date(weekStart.setHours(0, 0, 0, 0)),
        $lte: new Date()
      };
      break;
    case 'month':
      dateFilter = {
        $gte: new Date(now.getFullYear(), now.getMonth(), 1),
        $lte: new Date()
      };
      break;
    case 'custom':
      if (startDate && endDate) {
        dateFilter = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        };
      }
      break;
  }

  const query = {
    driverId: req.user._id,
    status: 'delivered'
  };

  if (Object.keys(dateFilter).length > 0) {
    query.actualDeliveryTime = dateFilter;
  }

  // Calculate earnings
  const [earnings] = await Order.aggregate([
    { $match: query },
    {
      $group: {
        _id: null,
        totalDeliveries: { $sum: 1 },
        totalDistance: { $sum: '$distance' }, // Assuming you add distance field
        totalEarnings: {
          $sum: {
            $multiply: ['$pricing.deliveryFee', 0.8] // Driver gets 80% of delivery fee
          }
        },
        averageDeliveryTime: {
          $avg: {
            $subtract: ['$actualDeliveryTime', '$createdAt']
          }
        }
      }
    }
  ]);

  // Get recent deliveries
  const recentDeliveries = await Order.find(query)
    .sort({ actualDeliveryTime: -1 })
    .limit(10)
    .select('orderNumber pricing.deliveryFee actualDeliveryTime restaurantId deliveryAddress')
    .populate('restaurantId', 'name');

  res.status(200).json({
    success: true,
    data: {
      period,
      earnings: earnings || {
        totalDeliveries: 0,
        totalDistance: 0,
        totalEarnings: 0,
        averageDeliveryTime: 0
      },
      recentDeliveries
    }
  });
});

/**
 * @desc    Get driver statistics
 * @route   GET /api/driver/stats
 * @access  Private (Driver)
 */
exports.getDriverStats = asyncHandler(async (req, res) => {
  const driverId = req.user._id;

  // Get all-time stats
  const [stats] = await Order.aggregate([
    {
      $match: {
        driverId: driverId,
        status: 'delivered'
      }
    },
    {
      $group: {
        _id: null,
        totalDeliveries: { $sum: 1 },
        totalEarnings: {
          $sum: {
            $multiply: ['$pricing.deliveryFee', 0.8]
          }
        }
      }
    }
  ]);

  // Get today's stats
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [todayStats] = await Order.aggregate([
    {
      $match: {
        driverId: driverId,
        status: 'delivered',
        actualDeliveryTime: { $gte: today }
      }
    },
    {
      $group: {
        _id: null,
        todayDeliveries: { $sum: 1 },
        todayEarnings: {
          $sum: {
            $multiply: ['$pricing.deliveryFee', 0.8]
          }
        },
        todayDistance: { $sum: '$distance' }
      }
    }
  ]);

  // Get active orders count
  const activeOrders = await Order.countDocuments({
    driverId: driverId,
    status: { $in: ['assigned', 'picked', 'en_route'] }
  });

  res.status(200).json({
    success: true,
    data: {
      allTime: stats || { totalDeliveries: 0, totalEarnings: 0 },
      today: todayStats || { todayDeliveries: 0, todayEarnings: 0, todayDistance: 0 },
      activeOrders,
      isAvailable: req.user.isAvailable
    }
  });
});

/**
 * @desc    Accept order assignment
 * @route   POST /api/driver/orders/:orderId/accept
 * @access  Private (Driver)
 */
exports.acceptOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.orderId);

  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Order not found'
    });
  }

  // Check if driver already has an active order
  const activeOrder = await Order.findOne({
    driverId: req.user._id,
    status: { $in: ['assigned', 'picked', 'en_route'] }
  });

  if (activeOrder) {
    return res.status(400).json({
      success: false,
      message: 'You already have an active order. Please complete it before accepting a new one.'
    });
  }

  // Handle two cases:
  // 1. Order is 'ready' (no driver assigned yet) - driver claims the order
  // 2. Order is 'assigned' (already assigned to this driver) - driver accepts and picks up

  if (order.status === 'ready') {
    // Driver is claiming an available order
    if (order.driverId) {
      return res.status(400).json({
        success: false,
        message: 'This order has already been claimed by another driver'
      });
    }

    // Assign driver and update status to 'assigned'
    order.driverId = req.user._id;
    await order.updateStatus('assigned', req.user._id, 'Driver accepted order');
    await order.save();

    return res.status(200).json({
      success: true,
      message: 'Order accepted successfully',
      data: { order }
    });
  }

  // For already assigned orders, verify it's assigned to this driver
  if (!order.driverId || order.driverId.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'This order is not assigned to you'
    });
  }

  if (order.status !== 'assigned') {
    return res.status(400).json({
      success: false,
      message: 'Order cannot be accepted at this stage'
    });
  }

  await order.updateStatus('picked', req.user._id, 'Driver accepted and picked up order');
  await order.save();

  res.status(200).json({
    success: true,
    message: 'Order accepted',
    data: { order }
  });
});

/**
 * @desc    Reject order assignment
 * @route   POST /api/driver/orders/:orderId/reject
 * @access  Private (Driver)
 */
exports.rejectOrder = asyncHandler(async (req, res) => {
  const { reason } = req.body;

  const order = await Order.findById(req.params.orderId);

  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Order not found'
    });
  }

  // Verify assignment
  if (!order.driverId || order.driverId.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'This order is not assigned to you'
    });
  }

  if (order.status !== 'assigned') {
    return res.status(400).json({
      success: false,
      message: 'Order cannot be rejected at this stage'
    });
  }

  // Unassign driver
  order.driverId = null;
  await order.updateStatus('ready', req.user._id, `Driver rejected: ${reason}`);
  await order.save();

  res.status(200).json({
    success: true,
    message: 'Order rejected',
    data: { order }
  });
});
