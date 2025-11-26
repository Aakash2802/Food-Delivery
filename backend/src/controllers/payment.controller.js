const Order = require('../models/Order');
const { asyncHandler } = require('../middleware/error.middleware');
const config = require('../config/env');
const crypto = require('crypto');

// Initialize payment gateways
let razorpay, stripe;

if (!config.payment.useMock) {
  if (config.payment.razorpay.keyId && config.payment.razorpay.keySecret) {
    const Razorpay = require('razorpay');
    razorpay = new Razorpay({
      key_id: config.payment.razorpay.keyId,
      key_secret: config.payment.razorpay.keySecret
    });
  }

  if (config.payment.stripe.secretKey) {
    const Stripe = require('stripe');
    stripe = Stripe(config.payment.stripe.secretKey);
  }
}

/**
 * @desc    Create payment order (Razorpay)
 * @route   POST /api/payments/create
 * @access  Private
 */
exports.createPaymentOrder = asyncHandler(async (req, res) => {
  const { orderId, gateway = 'razorpay' } = req.body;

  const order = await Order.findById(orderId);

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

  // Check if payment already completed
  if (order.paymentInfo.status === 'completed') {
    return res.status(400).json({
      success: false,
      message: 'Payment already completed'
    });
  }

  const amount = Math.round(order.pricing.total * 100); // Convert to paise/cents

  let paymentOrder;

  if (config.payment.useMock) {
    // Mock payment order
    paymentOrder = {
      id: `mock_order_${Date.now()}`,
      amount,
      currency: 'INR',
      receipt: order.orderNumber
    };
  } else if (gateway === 'razorpay' && razorpay) {
    // Create Razorpay order
    try {
      paymentOrder = await razorpay.orders.create({
        amount,
        currency: 'INR',
        receipt: order.orderNumber,
        notes: {
          orderId: order._id.toString(),
          customerId: req.user._id.toString()
        }
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to create payment order',
        error: error.message
      });
    }
  } else if (gateway === 'stripe' && stripe) {
    // Create Stripe payment intent
    try {
      paymentOrder = await stripe.paymentIntents.create({
        amount,
        currency: 'inr',
        metadata: {
          orderId: order._id.toString(),
          orderNumber: order.orderNumber,
          customerId: req.user._id.toString()
        }
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to create payment intent',
        error: error.message
      });
    }
  } else {
    return res.status(400).json({
      success: false,
      message: 'Payment gateway not configured'
    });
  }

  // Update order with payment gateway details
  order.paymentInfo.paymentGateway = config.payment.useMock ? 'mock' : gateway;
  order.paymentInfo.gatewayOrderId = paymentOrder.id;
  await order.save();

  res.status(200).json({
    success: true,
    data: {
      paymentOrder: {
        id: paymentOrder.id,
        amount,
        currency: gateway === 'stripe' ? 'inr' : 'INR',
        key: gateway === 'razorpay' ? config.payment.razorpay.keyId : config.payment.stripe.publishableKey,
        orderNumber: order.orderNumber
      }
    }
  });
});

/**
 * @desc    Verify payment (Razorpay)
 * @route   POST /api/payments/verify
 * @access  Private
 */
exports.verifyPayment = asyncHandler(async (req, res) => {
  const {
    orderId,
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature
  } = req.body;

  const order = await Order.findById(orderId);

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

  if (config.payment.useMock) {
    // Mock verification - always succeed
    order.paymentInfo.status = 'completed';
    order.paymentInfo.transactionId = razorpay_payment_id || `mock_${Date.now()}`;
    order.paymentInfo.paidAt = new Date();
    await order.save();

    return res.status(200).json({
      success: true,
      message: 'Payment verified successfully (mock)',
      data: { order }
    });
  }

  // Verify Razorpay signature
  if (razorpay && order.paymentInfo.paymentGateway === 'razorpay') {
    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', config.payment.razorpay.keySecret)
      .update(sign.toString())
      .digest('hex');

    if (razorpay_signature !== expectedSign) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature'
      });
    }

    // Update order payment status
    order.paymentInfo.status = 'completed';
    order.paymentInfo.transactionId = razorpay_payment_id;
    order.paymentInfo.paidAt = new Date();
    await order.save();

    res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      data: { order }
    });
  } else {
    res.status(400).json({
      success: false,
      message: 'Payment gateway not configured or invalid'
    });
  }
});

/**
 * @desc    Mock payment (Development only)
 * @route   POST /api/payments/mock
 * @access  Private
 */
exports.mockPayment = asyncHandler(async (req, res) => {
  if (!config.payment.useMock && config.env === 'production') {
    return res.status(403).json({
      success: false,
      message: 'Mock payment is not available in production'
    });
  }

  const { orderId, status = 'success' } = req.body;

  const order = await Order.findById(orderId);

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

  if (status === 'success') {
    order.paymentInfo.status = 'completed';
    order.paymentInfo.transactionId = `mock_txn_${Date.now()}`;
    order.paymentInfo.paymentGateway = 'mock';
    order.paymentInfo.paidAt = new Date();
  } else {
    order.paymentInfo.status = 'failed';
  }

  await order.save();

  res.status(200).json({
    success: true,
    message: `Mock payment ${status}`,
    data: { order }
  });
});

/**
 * @desc    Webhook handler for payment gateway
 * @route   POST /api/payments/webhook
 * @access  Public (with signature verification)
 */
exports.webhookHandler = asyncHandler(async (req, res) => {
  const signature = req.headers['x-razorpay-signature'] || req.headers['stripe-signature'];
  const gateway = req.headers['x-razorpay-signature'] ? 'razorpay' : 'stripe';

  if (gateway === 'razorpay' && razorpay) {
    // Verify Razorpay webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', config.payment.razorpay.keySecret)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (signature !== expectedSignature) {
      return res.status(400).json({
        success: false,
        message: 'Invalid webhook signature'
      });
    }

    const event = req.body.event;
    const paymentEntity = req.body.payload.payment.entity;

    if (event === 'payment.captured') {
      // Find order and update payment status
      const order = await Order.findOne({
        'paymentInfo.gatewayOrderId': paymentEntity.order_id
      });

      if (order) {
        order.paymentInfo.status = 'completed';
        order.paymentInfo.transactionId = paymentEntity.id;
        order.paymentInfo.paidAt = new Date(paymentEntity.created_at * 1000);
        await order.save();
      }
    } else if (event === 'payment.failed') {
      const order = await Order.findOne({
        'paymentInfo.gatewayOrderId': paymentEntity.order_id
      });

      if (order) {
        order.paymentInfo.status = 'failed';
        await order.save();
      }
    }

    res.status(200).json({ received: true });
  } else if (gateway === 'stripe' && stripe) {
    // Verify Stripe webhook signature
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        signature,
        config.payment.stripe.webhookSecret
      );
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: 'Invalid webhook signature'
      });
    }

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;

      const order = await Order.findById(paymentIntent.metadata.orderId);

      if (order) {
        order.paymentInfo.status = 'completed';
        order.paymentInfo.transactionId = paymentIntent.id;
        order.paymentInfo.paidAt = new Date();
        await order.save();
      }
    } else if (event.type === 'payment_intent.payment_failed') {
      const paymentIntent = event.data.object;

      const order = await Order.findById(paymentIntent.metadata.orderId);

      if (order) {
        order.paymentInfo.status = 'failed';
        await order.save();
      }
    }

    res.status(200).json({ received: true });
  } else {
    res.status(400).json({
      success: false,
      message: 'Payment gateway not configured'
    });
  }
});

/**
 * @desc    Get payment history
 * @route   GET /api/payments/history
 * @access  Private
 */
exports.getPaymentHistory = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;

  const query = {
    customerId: req.user._id,
    'paymentInfo.status': 'completed'
  };

  const total = await Order.countDocuments(query);

  const orders = await Order.find(query)
    .select('orderNumber pricing paymentInfo createdAt')
    .sort({ 'paymentInfo.paidAt': -1 })
    .limit(parseInt(limit))
    .skip((parseInt(page) - 1) * parseInt(limit));

  res.status(200).json({
    success: true,
    data: {
      payments: orders.map(order => ({
        orderId: order._id,
        orderNumber: order.orderNumber,
        amount: order.pricing.total,
        method: order.paymentInfo.method,
        transactionId: order.paymentInfo.transactionId,
        paidAt: order.paymentInfo.paidAt,
        gateway: order.paymentInfo.paymentGateway
      }))
    },
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
});
