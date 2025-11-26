const PromoCode = require('../models/PromoCode');
const { asyncHandler } = require('../middleware/error.middleware');

/**
 * @desc    Get all active promo codes for customers
 * @route   GET /api/promos
 * @access  Public
 */
const getActivePromoCodes = asyncHandler(async (req, res) => {
  const now = new Date();

  const promos = await PromoCode.find({
    isActive: true,
    validFrom: { $lte: now },
    validUntil: { $gte: now }
  })
    .select('code description type value minOrderValue maxDiscount applicableFor validUntil')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: promos
  });
});

/**
 * @desc    Validate and apply promo code
 * @route   POST /api/promos/validate
 * @access  Private (Customer)
 */
const validatePromoCode = asyncHandler(async (req, res) => {
  const { code, orderValue, restaurantId } = req.body;
  const userId = req.user?._id;

  if (!code) {
    return res.status(400).json({
      success: false,
      message: 'Promo code is required'
    });
  }

  if (!orderValue) {
    return res.status(400).json({
      success: false,
      message: 'Order value is required'
    });
  }

  const promo = await PromoCode.findOne({
    code: code.toUpperCase()
  });

  if (!promo) {
    return res.status(404).json({
      success: false,
      message: 'Invalid promo code'
    });
  }

  // Validate promo code
  const validation = promo.isValidFor(userId, orderValue, restaurantId);

  if (!validation.valid) {
    return res.status(400).json({
      success: false,
      message: validation.message
    });
  }

  // Calculate discount
  const discount = promo.calculateDiscount(orderValue);

  res.status(200).json({
    success: true,
    message: 'Promo code is valid',
    data: {
      code: promo.code,
      description: promo.description,
      discount,
      finalAmount: Math.max(0, orderValue - discount)
    }
  });
});

/**
 * @desc    Apply promo code to order
 * @route   POST /api/promos/apply
 * @access  Private (Customer)
 */
const applyPromoCode = asyncHandler(async (req, res) => {
  const { code, orderId } = req.body;
  const userId = req.user._id;

  if (!code || !orderId) {
    return res.status(400).json({
      success: false,
      message: 'Code and order ID are required'
    });
  }

  const promo = await PromoCode.findOne({
    code: code.toUpperCase()
  });

  if (!promo) {
    return res.status(404).json({
      success: false,
      message: 'Invalid promo code'
    });
  }

  // Increment usage
  await promo.incrementUsage(userId);

  res.status(200).json({
    success: true,
    message: 'Promo code applied successfully',
    data: { promo }
  });
});

/**
 * Admin Functions
 */

/**
 * @desc    Get all promo codes (Admin)
 * @route   GET /api/admin/promos
 * @access  Private (Admin)
 */
const getAllPromos = asyncHandler(async (req, res) => {
  const promos = await PromoCode.find()
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: promos
  });
});

/**
 * @desc    Create new promo code (Admin)
 * @route   POST /api/admin/promos
 * @access  Private (Admin)
 */
const createPromo = asyncHandler(async (req, res) => {
  const promo = await PromoCode.create(req.body);

  res.status(201).json({
    success: true,
    message: 'Promo code created successfully',
    data: promo
  });
});

/**
 * @desc    Update promo code (Admin)
 * @route   PUT /api/admin/promos/:id
 * @access  Private (Admin)
 */
const updatePromo = asyncHandler(async (req, res) => {
  const promo = await PromoCode.findById(req.params.id);

  if (!promo) {
    return res.status(404).json({
      success: false,
      message: 'Promo code not found'
    });
  }

  // Don't allow updating the code itself
  delete req.body.code;

  // If type is 'fixed', remove maxDiscount
  if (req.body.type === 'fixed') {
    req.body.maxDiscount = undefined;
  }

  // Validate dates manually before update
  const validFrom = req.body.validFrom ? new Date(req.body.validFrom) : promo.validFrom;
  const validUntil = req.body.validUntil ? new Date(req.body.validUntil) : promo.validUntil;

  if (validUntil <= validFrom) {
    return res.status(400).json({
      success: false,
      message: 'Valid until date must be after valid from date'
    });
  }

  // Update using .save() to trigger validation properly
  Object.assign(promo, req.body);
  await promo.save();

  res.status(200).json({
    success: true,
    message: 'Promo code updated successfully',
    data: promo
  });
});

/**
 * @desc    Delete promo code (Admin)
 * @route   DELETE /api/admin/promos/:id
 * @access  Private (Admin)
 */
const deletePromo = asyncHandler(async (req, res) => {
  const promo = await PromoCode.findById(req.params.id);

  if (!promo) {
    return res.status(404).json({
      success: false,
      message: 'Promo code not found'
    });
  }

  await PromoCode.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Promo code deleted successfully'
  });
});

/**
 * @desc    Toggle promo code active status (Admin)
 * @route   PATCH /api/admin/promos/:id/toggle
 * @access  Private (Admin)
 */
const togglePromoStatus = asyncHandler(async (req, res) => {
  const promo = await PromoCode.findById(req.params.id);

  if (!promo) {
    return res.status(404).json({
      success: false,
      message: 'Promo code not found'
    });
  }

  promo.isActive = !promo.isActive;
  await promo.save();

  res.status(200).json({
    success: true,
    message: `Promo code ${promo.isActive ? 'activated' : 'deactivated'} successfully`,
    data: promo
  });
});

module.exports = {
  getActivePromoCodes,
  validatePromoCode,
  applyPromoCode,
  // Admin functions
  getAllPromos,
  createPromo,
  updatePromo,
  deletePromo,
  togglePromoStatus
};
