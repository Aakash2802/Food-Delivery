const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const Restaurant = require('../models/Restaurant');
const User = require('../models/User');
const { asyncHandler } = require('../middleware/error.middleware');
const { calculateOrderPricing, estimateDeliveryTime, paginate, buildPaginationResponse } = require('../utils/helpers');
const { awardCoinsForOrder } = require('../services/loyaltyService');
const { emitNewOrder, emitOrderStatusUpdate, emitDriverAssigned } = require('../sockets');

// Status each role may move an order to, keyed by the order's current status
const VENDOR_TRANSITIONS = {
  pending: ['confirmed', 'rejected'],
  confirmed: ['preparing', 'rejected'],
  preparing: ['ready']
};

const DRIVER_TRANSITIONS = {
  assigned: ['picked'],
  picked: ['en_route', 'delivered'],
  en_route: ['delivered']
};

/**
 * @desc    Create new order
 * @route   POST /api/orders
 * @access  Private (Customer)
 */
exports.createOrder = asyncHandler(async (req, res) => {
  console.log('🚀 CREATE ORDER CALLED');
  console.log('📦 Full request body:', JSON.stringify(req.body, null, 2));

  const { restaurantId, items, deliveryAddress, contactPhone, paymentMethod, promoCode, scheduledFor } = req.body;

  console.log('📦 Order Request:', { restaurantId, itemsCount: items?.length, deliveryAddress });

  // Verify restaurant exists and is active
  const restaurant = await Restaurant.findById(restaurantId);
  if (!restaurant || !restaurant.isActive || !restaurant.isApproved) {
    console.log('❌ Restaurant validation failed:', {
      found: !!restaurant,
      isActive: restaurant?.isActive,
      isApproved: restaurant?.isApproved
    });
    return res.status(400).json({
      success: false,
      message: 'Restaurant is not available'
    });
  }

  if (!restaurant.isOpen) {
    console.log('❌ Restaurant is closed');
    return res.status(400).json({
      success: false,
      message: 'Restaurant is currently closed'
    });
  }

  console.log('✅ Restaurant validation passed');

  // Verify all menu items exist and are available
  const menuItemIds = items.map(item => item.menuItemId);
  console.log('📝 Menu item IDs:', menuItemIds);

  const menuItems = await MenuItem.find({
    _id: { $in: menuItemIds },
    restaurantId,
    isAvailable: true
  });

  console.log('📝 Found menu items:', menuItems.length, 'Expected:', items.length);

  // Compare against unique IDs - the same dish can appear twice with different customizations
  if (menuItems.length !== new Set(menuItemIds.map(String)).size) {
    console.log('❌ Menu items validation failed');
    return res.status(400).json({
      success: false,
      message: 'Some menu items are not available'
    });
  }

  // Build order items with pricing
  const orderItems = items.map(item => {
    const menuItem = menuItems.find(m => m._id.toString() === item.menuItemId);

    const customizations = item.customizations?.map(custom => {
      const menuCustomization = menuItem.customizations?.find(c => c.name === custom.name);
      if (menuCustomization) {
        // Price of this customization only (not a running total across all of them)
        let customizationPrice = 0;
        const selectedOptions = custom.selectedOptions.map(opt => {
          const option = menuCustomization.options.find(o => o.label === opt);
          if (option) {
            customizationPrice += option.price;
            return opt;
          }
          return null;
        }).filter(Boolean);

        return {
          name: custom.name,
          selectedOptions,
          additionalPrice: customizationPrice
        };
      }
      return null;
    }).filter(Boolean);

    return {
      menuItemId: menuItem._id,
      name: menuItem.name,
      quantity: item.quantity,
      price: menuItem.price,
      customizations,
      specialInstructions: item.specialInstructions
    };
  });

  // Calculate pricing
  let promoDiscount = 0;
  if (promoCode) {
    console.log('🎟️  Processing promo code:', promoCode);
    const PromoCode = require('../models/PromoCode');
    const promo = await PromoCode.findOne({ code: promoCode.toUpperCase(), isActive: true });
    console.log('🎟️  Promo found:', !!promo);

    if (promo) {
      // Calculate subtotal FIRST for validation
      const subtotal = orderItems.reduce((sum, item) => {
        const itemTotal = item.price + (item.customizations?.reduce((s, c) => s + (c.additionalPrice || 0), 0) || 0);
        return sum + (itemTotal * item.quantity);
      }, 0);
      console.log('🎟️  Subtotal for validation:', subtotal);

      const validation = promo.isValidFor(req.user._id, subtotal, restaurantId);
      console.log('🎟️  Promo validation:', validation);
      if (validation.valid) {
        promoDiscount = promo.calculateDiscount(subtotal);
        console.log('🎟️  Calculated discount:', promoDiscount);
        await promo.incrementUsage(req.user._id);
      }
    }
  }
  console.log('💰 Final promoDiscount:', promoDiscount);

  const pricing = calculateOrderPricing(
    orderItems,
    restaurant.deliveryFee,
    promoDiscount,
    restaurant.commissionRate
  );

  // Check minimum order value
  if (pricing.subtotal < restaurant.minimumOrder) {
    return res.status(400).json({
      success: false,
      message: `Minimum order value is ₹${restaurant.minimumOrder}`
    });
  }

  // Create order
  const order = await Order.create({
    customerId: req.user._id,
    restaurantId,
    items: orderItems,
    pricing,
    deliveryAddress,
    contactPhone: contactPhone || req.user.phone,
    status: 'pending',
    paymentInfo: {
      method: paymentMethod,
      status: paymentMethod === 'cod' ? 'pending' : 'pending'
    },
    promoCode: promoCode ? {
      code: promoCode.toUpperCase(),
      discount: promoDiscount
    } : undefined,
    commission: pricing.commission,
    scheduledFor: scheduledFor || undefined,
    estimatedDeliveryTime: scheduledFor
      ? new Date(scheduledFor)
      : new Date(Date.now() + (restaurant.deliveryTime.max + 15) * 60000)
  });

  // Update restaurant order count
  restaurant.currentOrdersCount += 1;
  await restaurant.save();

  // Notify vendor/admin in real time (before populate, so IDs are plain ObjectIds)
  emitNewOrder(order);

  // If payment method is not COD, create payment order
  let paymentDetails = null;
  if (paymentMethod !== 'cod') {
    // This will be handled by payment controller
    paymentDetails = {
      amount: Math.round(pricing.total * 100), // Convert to paise/cents
      currency: 'INR',
      orderId: order._id
    };
  }

  // Populate order details
  await order.populate([
    { path: 'customerId', select: 'name email phone' },
    { path: 'restaurantId', select: 'name location contactInfo' }
  ]);

  res.status(201).json({
    success: true,
    message: 'Order placed successfully',
    data: {
      order,
      paymentDetails
    }
  });
});

/**
 * @desc    Get user orders
 * @route   GET /api/orders
 * @access  Private
 */
exports.getUserOrders = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;

  const query = {};

  // Filter by role
  switch (req.user.role) {
    case 'customer':
      query.customerId = req.user._id;
      break;
    case 'vendor':
      // Find vendor's restaurant first
      const vendorRestaurant = await Restaurant.findOne({ ownerId: req.user._id });
      if (!vendorRestaurant) {
        return res.status(400).json({
          success: false,
          message: 'You do not have a restaurant'
        });
      }
      query.restaurantId = vendorRestaurant._id;
      break;
    case 'driver':
      query.driverId = req.user._id;
      break;
    case 'admin':
      // Admin can see all orders
      break;
    default:
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
  }

  // Filter by status
  if (status) {
    query.status = status;
  }

  const total = await Order.countDocuments(query);

  let ordersQuery = Order.find(query)
    .sort({ createdAt: -1 })
    .populate('customerId', 'name phone')
    .populate('restaurantId', 'name location contactInfo')
    .populate('driverId', 'name phone vehicleDetails');

  ordersQuery = paginate(ordersQuery, page, limit);

  const orders = await ordersQuery;

  res.status(200).json({
    success: true,
    ...buildPaginationResponse(orders, page, limit, total)
  });
});

/**
 * @desc    Get order by ID
 * @route   GET /api/orders/:orderId
 * @access  Private
 */
exports.getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.orderId)
    .populate('customerId', 'name email phone')
    .populate('restaurantId', 'name location contactInfo rating')
    .populate('driverId', 'name phone vehicleDetails currentLocation')
    .populate('items.menuItemId', 'name images');

  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Order not found'
    });
  }

  // Check access permissions
  const hasAccess =
    req.user.role === 'admin' ||
    order.customerId._id.toString() === req.user._id.toString() ||
    (order.restaurantId && order.restaurantId._id.toString() === req.user.restaurantId?.toString()) ||
    (order.driverId && order.driverId._id.toString() === req.user._id.toString());

  if (!hasAccess) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  res.status(200).json({
    success: true,
    data: {
      order
    }
  });
});

/**
 * @desc    Update order status (Vendor)
 * @route   PATCH /api/vendor/orders/:orderId/status
 * @access  Private (Vendor)
 */
exports.updateOrderStatusVendor = asyncHandler(async (req, res) => {
  const { status, preparationTime, note } = req.body;

  const order = await Order.findById(req.params.orderId);

  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Order not found'
    });
  }

  // Verify ownership - find vendor's restaurant first
  const vendorRestaurant = await Restaurant.findOne({ ownerId: req.user._id });
  if (!vendorRestaurant) {
    return res.status(400).json({
      success: false,
      message: 'You do not have a restaurant'
    });
  }

  if (order.restaurantId.toString() !== vendorRestaurant._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  // Allowed status transitions for vendor
  const allowedNext = VENDOR_TRANSITIONS[order.status] || [];
  if (!allowedNext.includes(status)) {
    return res.status(400).json({
      success: false,
      message: `Cannot change order from '${order.status}' to '${status}'`
    });
  }

  // Update order
  await order.updateStatus(status, req.user._id, note);

  if (preparationTime) {
    order.preparationTime = preparationTime;
    order.estimatedDeliveryTime = order.calculateDeliveryTime(preparationTime, 15);
  }

  if (status === 'rejected' || status === 'cancelled') {
    // Decrease restaurant order count
    const restaurant = await Restaurant.findById(order.restaurantId);
    if (restaurant) {
      restaurant.currentOrdersCount = Math.max(0, restaurant.currentOrdersCount - 1);
      await restaurant.save();
    }
  }

  await order.save();

  emitOrderStatusUpdate(order);

  res.status(200).json({
    success: true,
    message: 'Order status updated',
    data: {
      order
    }
  });
});

/**
 * @desc    Update order status (Driver)
 * @route   PATCH /api/driver/orders/:orderId/status
 * @access  Private (Driver)
 */
exports.updateOrderStatusDriver = asyncHandler(async (req, res) => {
  const { status, note } = req.body;

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

  // Allowed status transitions for driver
  const allowedNext = DRIVER_TRANSITIONS[order.status] || [];
  if (!allowedNext.includes(status)) {
    return res.status(400).json({
      success: false,
      message: `Cannot change order from '${order.status}' to '${status}'`
    });
  }

  // Update order
  await order.updateStatus(status, req.user._id, note);

  if (status === 'delivered') {
    order.actualDeliveryTime = new Date();
    order.paymentInfo.status = 'completed';

    // Calculate distance
    const restaurant = await Restaurant.findById(order.restaurantId);
    const restCoords = restaurant?.location?.coordinates?.coordinates;
    if (restCoords?.length === 2 && order.deliveryAddress?.location?.coordinates) {
      const { calculateDistance } = require('../utils/helpers');
      const [restLng, restLat] = restCoords;
      const [custLng, custLat] = order.deliveryAddress.location.coordinates;
      // calculateDistance returns metres; Order.distance is in km
      order.distance = Math.round(calculateDistance(
        { latitude: restLat, longitude: restLng },
        { latitude: custLat, longitude: custLng }
      ) / 10) / 100;
    }

    // Decrease restaurant order count
    if (restaurant) {
      restaurant.currentOrdersCount = Math.max(0, restaurant.currentOrdersCount - 1);
      await restaurant.save();
    }

    // Award loyalty coins to customer
    try {
      const loyaltyResult = await awardCoinsForOrder(
        order.customerId,
        order._id,
        order.pricing.total
      );
      if (loyaltyResult.success) {
        console.log(`✅ Awarded ${loyaltyResult.coinsAwarded} loyalty coins to customer`);
      }
    } catch (error) {
      console.error('Error awarding loyalty coins:', error);
      // Don't fail the order delivery if loyalty coins fail
    }
  }

  await order.save();

  emitOrderStatusUpdate(order);

  res.status(200).json({
    success: true,
    message: 'Order status updated',
    data: {
      order
    }
  });
});

/**
 * @desc    Cancel order (Customer)
 * @route   POST /api/orders/:orderId/cancel
 * @access  Private (Customer)
 */
exports.cancelOrder = asyncHandler(async (req, res) => {
  const { reason } = req.body;

  const order = await Order.findById(req.params.orderId);

  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Order not found'
    });
  }

  // Verify ownership
  if (order.customerId.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  // Check if order can be cancelled
  if (!order.canBeCancelled) {
    return res.status(400).json({
      success: false,
      message: 'Order cannot be cancelled at this stage'
    });
  }

  await order.updateStatus('cancelled', req.user._id, reason);
  order.cancellationReason = reason;

  // Process refund if payment was completed
  if (order.paymentInfo.status === 'completed') {
    order.refundAmount = order.pricing.total;
    order.paymentInfo.status = 'refunded';
  }

  // Decrease restaurant order count
  const restaurant = await Restaurant.findById(order.restaurantId);
  if (restaurant) {
    restaurant.currentOrdersCount = Math.max(0, restaurant.currentOrdersCount - 1);
    await restaurant.save();
  }

  await order.save();

  emitOrderStatusUpdate(order);

  res.status(200).json({
    success: true,
    message: 'Order cancelled successfully',
    data: {
      order
    }
  });
});

/**
 * @desc    Assign driver to order (Admin)
 * @route   POST /api/admin/orders/:orderId/assign
 * @access  Private (Admin)
 */
exports.assignDriver = asyncHandler(async (req, res) => {
  const { driverId } = req.body;

  const order = await Order.findById(req.params.orderId);

  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Order not found'
    });
  }

  // Verify driver exists and is available
  const driver = await User.findOne({
    _id: driverId,
    role: 'driver',
    isActive: true,
    isAvailable: true
  });

  if (!driver) {
    return res.status(400).json({
      success: false,
      message: 'Driver not found or not available'
    });
  }

  // Order must be ready for pickup
  if (order.status !== 'ready') {
    return res.status(400).json({
      success: false,
      message: 'Order is not ready for pickup'
    });
  }

  order.driverId = driverId;
  await order.updateStatus('assigned', req.user._id, 'Driver assigned');
  await order.save();

  emitDriverAssigned(order, driver);
  emitOrderStatusUpdate(order);

  await order.populate('driverId', 'name phone vehicleDetails currentLocation');

  res.status(200).json({
    success: true,
    message: 'Driver assigned successfully',
    data: {
      order
    }
  });
});

/**
 * @desc    Get order statistics
 * @route   GET /api/orders/stats
 * @access  Private (Vendor/Admin)
 */
exports.getOrderStats = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  const query = {
    createdAt: {
      $gte: startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      $lte: endDate ? new Date(endDate) : new Date()
    }
  };

  // Filter by role
  if (req.user.role === 'vendor') {
    if (!req.user.restaurantId) {
      return res.status(400).json({
        success: false,
        message: 'You do not have a restaurant'
      });
    }
    query.restaurantId = req.user.restaurantId;
  }

  const [orderStats] = await Order.aggregate([
    { $match: query },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalRevenue: { $sum: '$pricing.total' },
        totalCommission: { $sum: '$commission.amount' },
        avgOrderValue: { $avg: '$pricing.total' },
        completedOrders: {
          $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] }
        },
        cancelledOrders: {
          $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
        }
      }
    }
  ]);

  res.status(200).json({
    success: true,
    data: {
      stats: orderStats || {
        totalOrders: 0,
        totalRevenue: 0,
        totalCommission: 0,
        avgOrderValue: 0,
        completedOrders: 0,
        cancelledOrders: 0
      }
    }
  });
});
