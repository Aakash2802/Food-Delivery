const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const Order = require('../models/Order');
const PromoCode = require('../models/PromoCode');
const { asyncHandler } = require('../middleware/error.middleware');
const { paginate, buildPaginationResponse } = require('../utils/helpers');

/**
 * @desc    Get admin dashboard statistics
 * @route   GET /api/admin/dashboard/stats
 * @access  Private (Admin)
 */
exports.getDashboardStats = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  const dateFilter = {};
  if (startDate && endDate) {
    dateFilter.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  } else {
    // Default to last 30 days
    dateFilter.createdAt = {
      $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    };
  }

  // Live order counts by status
  const liveOrders = await Order.aggregate([
    {
      $match: {
        status: { $in: ['pending', 'confirmed', 'preparing', 'ready', 'assigned', 'picked', 'en_route'] }
      }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  const liveOrdersObj = {
    total: 0,
    byStatus: {}
  };

  liveOrders.forEach(item => {
    liveOrdersObj.byStatus[item._id] = item.count;
    liveOrdersObj.total += item.count;
  });

  // Revenue statistics
  const [revenueStats] = await Order.aggregate([
    {
      $match: {
        ...dateFilter,
        status: 'delivered'
      }
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$pricing.total' },
        totalCommissions: { $sum: '$commission.amount' },
        totalOrders: { $sum: 1 },
        averageOrderValue: { $avg: '$pricing.total' }
      }
    }
  ]);

  // Get all counts
  const [
    totalUsers,
    totalRestaurants,
    totalOrders,
    activeRestaurants,
    activeDrivers,
    totalCustomers,
    pendingApprovals
  ] = await Promise.all([
    User.countDocuments({}),
    Restaurant.countDocuments({}),
    Order.countDocuments({}),
    Restaurant.countDocuments({ isActive: true, isApproved: true }),
    User.countDocuments({ role: 'driver', isActive: true, isAvailable: true }),
    User.countDocuments({ role: 'customer', isActive: true }),
    Restaurant.countDocuments({ isApproved: false, status: 'pending' })
  ]);

  // Average delivery time (in minutes)
  const [deliveryTimeStats] = await Order.aggregate([
    {
      $match: {
        status: 'delivered',
        actualDeliveryTime: { $exists: true }
      }
    },
    {
      $project: {
        deliveryTime: {
          $divide: [
            { $subtract: ['$actualDeliveryTime', '$createdAt'] },
            60000 // Convert to minutes
          ]
        }
      }
    },
    {
      $group: {
        _id: null,
        avgDeliveryTime: { $avg: '$deliveryTime' }
      }
    }
  ]);

  // Orders trend (last 7 days)
  const ordersTrend = await Order.aggregate([
    {
      $match: {
        createdAt: {
          $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
        },
        count: { $sum: 1 },
        revenue: { $sum: '$pricing.total' }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]);

  res.status(200).json({
    success: true,
    data: {
      totalUsers,
      totalRestaurants,
      totalOrders,
      totalRevenue: revenueStats?.totalRevenue || 0,
      activeDrivers,
      pendingApprovals,
      liveOrders: liveOrdersObj,
      revenue: revenueStats || {
        totalRevenue: 0,
        totalCommissions: 0,
        totalOrders: 0,
        averageOrderValue: 0
      },
      activeRestaurants,
      totalCustomers,
      averageDeliveryTime: deliveryTimeStats?.avgDeliveryTime || 0,
      ordersTrend
    }
  });
});

/**
 * @desc    Get all users (with filters)
 * @route   GET /api/admin/users
 * @access  Private (Admin)
 */
exports.getUsers = asyncHandler(async (req, res) => {
  const { role, search, isActive, page = 1, limit = 20 } = req.query;

  const query = {};

  if (role) {
    query.role = role;
  }

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } }
    ];
  }

  if (isActive !== undefined) {
    query.isActive = isActive === 'true';
  }

  const total = await User.countDocuments(query);

  let usersQuery = User.find(query)
    .select('-password -refreshTokens')
    .sort({ createdAt: -1 });

  usersQuery = paginate(usersQuery, page, limit);

  const users = await usersQuery;

  res.status(200).json({
    success: true,
    ...buildPaginationResponse(users, page, limit, total)
  });
});

/**
 * @desc    Update user status
 * @route   PATCH /api/admin/users/:userId/status
 * @access  Private (Admin)
 */
exports.updateUserStatus = asyncHandler(async (req, res) => {
  const { isActive } = req.body;

  const user = await User.findById(req.params.userId);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  user.isActive = isActive;
  await user.save();

  res.status(200).json({
    success: true,
    message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
    data: { user }
  });
});

/**
 * @desc    Get all drivers with location
 * @route   GET /api/admin/drivers
 * @access  Private (Admin)
 */
exports.getDrivers = asyncHandler(async (req, res) => {
  const { isAvailable, isActive, page = 1, limit = 20 } = req.query;

  const query = { role: 'driver' };

  if (isAvailable !== undefined) {
    query.isAvailable = isAvailable === 'true';
  }

  if (isActive !== undefined) {
    query.isActive = isActive === 'true';
  }

  const total = await User.countDocuments(query);

  let driversQuery = User.find(query)
    .select('-password -refreshTokens')
    .sort({ isAvailable: -1, createdAt: -1 });

  driversQuery = paginate(driversQuery, page, limit);

  const drivers = await driversQuery.lean();

  // Get active order count for each driver
  for (let driver of drivers) {
    const activeOrders = await Order.countDocuments({
      driverId: driver._id,
      status: { $in: ['assigned', 'picked', 'en_route'] }
    });

    const completedOrders = await Order.countDocuments({
      driverId: driver._id,
      status: 'delivered'
    });

    driver.activeOrders = activeOrders;
    driver.completedOrders = completedOrders;
  }

  res.status(200).json({
    success: true,
    ...buildPaginationResponse(drivers, page, limit, total)
  });
});

/**
 * @desc    Get live orders
 * @route   GET /api/admin/orders/live
 * @access  Private (Admin)
 */
exports.getLiveOrders = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 50 } = req.query;

  const query = {
    status: { $in: ['pending', 'confirmed', 'preparing', 'ready', 'assigned', 'picked', 'en_route'] }
  };

  if (status) {
    query.status = status;
  }

  const total = await Order.countDocuments(query);

  let ordersQuery = Order.find(query)
    .sort({ createdAt: -1 })
    .populate('customerId', 'name phone')
    .populate('restaurantId', 'name address contactNumber')
    .populate('driverId', 'name phone vehicleDetails currentLocation')
    .populate('items.menuItemId', 'name price');

  ordersQuery = paginate(ordersQuery, page, limit);

  const orders = await ordersQuery;

  res.status(200).json({
    success: true,
    ...buildPaginationResponse(orders, page, limit, total)
  });
});

/**
 * @desc    Get revenue report
 * @route   GET /api/admin/reports/revenue
 * @access  Private (Admin)
 */
exports.getRevenueReport = asyncHandler(async (req, res) => {
  const { startDate, endDate, groupBy = 'day' } = req.query;

  const matchStage = {
    status: 'delivered'
  };

  if (startDate && endDate) {
    matchStage.actualDeliveryTime = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  let groupFormat;
  switch (groupBy) {
    case 'hour':
      groupFormat = '%Y-%m-%d %H:00';
      break;
    case 'day':
      groupFormat = '%Y-%m-%d';
      break;
    case 'week':
      groupFormat = '%Y-W%U';
      break;
    case 'month':
      groupFormat = '%Y-%m';
      break;
    default:
      groupFormat = '%Y-%m-%d';
  }

  const report = await Order.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: {
          $dateToString: {
            format: groupFormat,
            date: '$actualDeliveryTime'
          }
        },
        totalOrders: { $sum: 1 },
        totalRevenue: { $sum: '$pricing.total' },
        totalCommissions: { $sum: '$commission.amount' },
        avgOrderValue: { $avg: '$pricing.total' }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  // Calculate totals
  const totals = report.reduce((acc, item) => ({
    orders: acc.orders + item.totalOrders,
    revenue: acc.revenue + item.totalRevenue,
    commissions: acc.commissions + item.totalCommissions
  }), { orders: 0, revenue: 0, commissions: 0 });

  res.status(200).json({
    success: true,
    data: {
      report,
      totals,
      groupBy
    }
  });
});

/**
 * @desc    Create promo code
 * @route   POST /api/admin/promos
 * @access  Private (Admin)
 */
exports.createPromoCode = asyncHandler(async (req, res) => {
  const promoData = {
    ...req.body,
    createdBy: req.user._id
  };

  const promo = await PromoCode.create(promoData);

  res.status(201).json({
    success: true,
    message: 'Promo code created successfully',
    data: { promo }
  });
});

/**
 * @desc    Get all promo codes
 * @route   GET /api/admin/promos
 * @access  Private (Admin)
 */
exports.getPromoCodes = asyncHandler(async (req, res) => {
  const { isActive, page = 1, limit = 20 } = req.query;

  const query = {};

  if (isActive !== undefined) {
    query.isActive = isActive === 'true';
  }

  const total = await PromoCode.countDocuments(query);

  let promosQuery = PromoCode.find(query)
    .sort({ createdAt: -1 })
    .populate('createdBy', 'name email');

  promosQuery = paginate(promosQuery, page, limit);

  const promos = await promosQuery;

  res.status(200).json({
    success: true,
    ...buildPaginationResponse(promos, page, limit, total)
  });
});

/**
 * @desc    Update promo code
 * @route   PUT /api/admin/promos/:promoId
 * @access  Private (Admin)
 */
exports.updatePromoCode = asyncHandler(async (req, res) => {
  const promo = await PromoCode.findById(req.params.promoId);

  if (!promo) {
    return res.status(404).json({
      success: false,
      message: 'Promo code not found'
    });
  }

  const allowedUpdates = [
    'description', 'isActive', 'validUntil', 'usageLimit'
  ];

  Object.keys(req.body).forEach(key => {
    if (allowedUpdates.includes(key)) {
      promo[key] = req.body[key];
    }
  });

  await promo.save();

  res.status(200).json({
    success: true,
    message: 'Promo code updated successfully',
    data: { promo }
  });
});

/**
 * @desc    Delete promo code
 * @route   DELETE /api/admin/promos/:promoId
 * @access  Private (Admin)
 */
exports.deletePromoCode = asyncHandler(async (req, res) => {
  const promo = await PromoCode.findById(req.params.promoId);

  if (!promo) {
    return res.status(404).json({
      success: false,
      message: 'Promo code not found'
    });
  }

  await promo.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Promo code deleted successfully'
  });
});

/**
 * @desc    Get platform analytics
 * @route   GET /api/admin/analytics
 * @access  Private (Admin)
 */
exports.getAnalytics = asyncHandler(async (req, res) => {
  const { period = 'month' } = req.query;

  let dateFilter;
  const now = new Date();

  switch (period) {
    case 'day':
      dateFilter = new Date(now.setHours(0, 0, 0, 0));
      break;
    case 'week':
      const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
      dateFilter = new Date(weekStart.setHours(0, 0, 0, 0));
      break;
    case 'month':
      dateFilter = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case 'year':
      dateFilter = new Date(now.getFullYear(), 0, 1);
      break;
    default:
      dateFilter = new Date(now.getFullYear(), now.getMonth(), 1);
  }

  // Top restaurants by revenue
  const topRestaurants = await Order.aggregate([
    {
      $match: {
        status: 'delivered',
        actualDeliveryTime: { $gte: dateFilter }
      }
    },
    {
      $group: {
        _id: '$restaurantId',
        totalOrders: { $sum: 1 },
        totalRevenue: { $sum: '$pricing.total' }
      }
    },
    { $sort: { totalRevenue: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: 'restaurants',
        localField: '_id',
        foreignField: '_id',
        as: 'restaurant'
      }
    },
    { $unwind: '$restaurant' },
    {
      $project: {
        restaurantName: '$restaurant.name',
        totalOrders: 1,
        totalRevenue: 1
      }
    }
  ]);

  // Top drivers by deliveries
  const topDrivers = await Order.aggregate([
    {
      $match: {
        status: 'delivered',
        actualDeliveryTime: { $gte: dateFilter }
      }
    },
    {
      $group: {
        _id: '$driverId',
        totalDeliveries: { $sum: 1 }
      }
    },
    { $sort: { totalDeliveries: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'driver'
      }
    },
    { $unwind: '$driver' },
    {
      $project: {
        driverName: '$driver.name',
        totalDeliveries: 1
      }
    }
  ]);

  // Order status distribution
  const statusDistribution = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: dateFilter }
      }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  res.status(200).json({
    success: true,
    data: {
      period,
      topRestaurants,
      topDrivers,
      statusDistribution
    }
  });
});

/**
 * @desc    Get all restaurants
 * @route   GET /api/admin/restaurants
 * @access  Private (Admin)
 */
exports.getAllRestaurants = asyncHandler(async (req, res) => {
  const { isApproved, isActive, search, page = 1, limit = 20 } = req.query;

  const query = {};

  if (isApproved !== undefined) {
    query.isApproved = isApproved === 'true';
  }

  if (isActive !== undefined) {
    query.isActive = isActive === 'true';
  }

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { contactNumber: { $regex: search, $options: 'i' } }
    ];
  }

  const total = await Restaurant.countDocuments(query);

  let restaurantsQuery = Restaurant.find(query)
    .populate('ownerId', 'name email phone')
    .sort({ createdAt: -1 });

  restaurantsQuery = paginate(restaurantsQuery, page, limit);

  const restaurants = await restaurantsQuery;

  res.status(200).json({
    success: true,
    data: restaurants,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

/**
 * @desc    Approve restaurant
 * @route   PATCH /api/admin/restaurants/:restaurantId/approve
 * @access  Private (Admin)
 */
exports.approveRestaurant = asyncHandler(async (req, res) => {
  const restaurant = await Restaurant.findById(req.params.restaurantId);

  if (!restaurant) {
    return res.status(404).json({
      success: false,
      message: 'Restaurant not found'
    });
  }

  restaurant.isApproved = true;
  restaurant.status = 'active';
  await restaurant.save();

  res.status(200).json({
    success: true,
    message: 'Restaurant approved successfully',
    data: { restaurant }
  });
});

/**
 * @desc    Reject restaurant
 * @route   PATCH /api/admin/restaurants/:restaurantId/reject
 * @access  Private (Admin)
 */
exports.rejectRestaurant = asyncHandler(async (req, res) => {
  const restaurant = await Restaurant.findById(req.params.restaurantId);

  if (!restaurant) {
    return res.status(404).json({
      success: false,
      message: 'Restaurant not found'
    });
  }

  restaurant.isApproved = false;
  restaurant.status = 'rejected';
  await restaurant.save();

  res.status(200).json({
    success: true,
    message: 'Restaurant rejected',
    data: { restaurant }
  });
});
