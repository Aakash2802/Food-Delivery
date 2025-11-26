const mongoose = require('mongoose');
const Review = require('../models/Review');
const Order = require('../models/Order');
const Restaurant = require('../models/Restaurant');
const asyncHandler = require('../middleware/async.middleware');

/**
 * @desc    Create a review
 * @route   POST /api/reviews
 * @access  Private (Customer)
 */
exports.createReview = asyncHandler(async (req, res) => {
  const { orderId, ratings, comment, images } = req.body;

  // Check if order exists and belongs to the user
  const order = await Order.findById(orderId);
  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Order not found'
    });
  }

  if (order.customerId.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'You can only review your own orders'
    });
  }

  // Check if order is delivered
  if (order.status !== 'delivered') {
    return res.status(400).json({
      success: false,
      message: 'You can only review delivered orders'
    });
  }

  // Check if review already exists for this order
  const existingReview = await Review.findOne({ orderId });
  if (existingReview) {
    return res.status(400).json({
      success: false,
      message: 'You have already reviewed this order'
    });
  }

  // Create review
  const review = await Review.create({
    orderId,
    customerId: req.user._id,
    restaurantId: order.restaurantId,
    driverId: order.driverId,
    ratings: {
      food: ratings.food,
      delivery: ratings.delivery || ratings.food,
      overall: ratings.overall || ratings.food
    },
    comment,
    images: images || []
  });

  await review.populate([
    { path: 'customerId', select: 'name profilePicture' },
    { path: 'restaurantId', select: 'name' }
  ]);

  res.status(201).json({
    success: true,
    message: 'Review created successfully',
    data: review
  });
});

/**
 * @desc    Get reviews for a restaurant
 * @route   GET /api/reviews/restaurant/:restaurantId
 * @access  Public
 */
exports.getRestaurantReviews = asyncHandler(async (req, res) => {
  const { restaurantId } = req.params;
  const { page = 1, limit = 10, sort = '-createdAt' } = req.query;

  const skip = (page - 1) * limit;

  const query = {
    restaurantId,
    isPublished: true,
    isFlagged: false
  };

  const reviews = await Review.find(query)
    .populate('customerId', 'name profilePicture')
    .populate('orderId', 'orderNumber items')
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Review.countDocuments(query);

  // Calculate rating statistics
  const ratingStats = await Review.aggregate([
    { $match: { restaurantId: new mongoose.Types.ObjectId(restaurantId), isPublished: true } },
    {
      $group: {
        _id: null,
        avgFood: { $avg: '$ratings.food' },
        avgDelivery: { $avg: '$ratings.delivery' },
        avgOverall: { $avg: '$ratings.overall' },
        totalReviews: { $sum: 1 },
        fiveStars: { $sum: { $cond: [{ $eq: ['$ratings.overall', 5] }, 1, 0] } },
        fourStars: { $sum: { $cond: [{ $eq: ['$ratings.overall', 4] }, 1, 0] } },
        threeStars: { $sum: { $cond: [{ $eq: ['$ratings.overall', 3] }, 1, 0] } },
        twoStars: { $sum: { $cond: [{ $eq: ['$ratings.overall', 2] }, 1, 0] } },
        oneStar: { $sum: { $cond: [{ $eq: ['$ratings.overall', 1] }, 1, 0] } }
      }
    }
  ]);

  res.status(200).json({
    success: true,
    data: {
      reviews,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      },
      stats: ratingStats[0] || {
        avgFood: 0,
        avgDelivery: 0,
        avgOverall: 0,
        totalReviews: 0,
        fiveStars: 0,
        fourStars: 0,
        threeStars: 0,
        twoStars: 0,
        oneStar: 0
      }
    }
  });
});

/**
 * @desc    Get review by order ID
 * @route   GET /api/reviews/order/:orderId
 * @access  Private
 */
exports.getReviewByOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  const review = await Review.findOne({ orderId })
    .populate('customerId', 'name profilePicture')
    .populate('restaurantId', 'name images')
    .populate('driverId', 'name phone');

  if (!review) {
    return res.status(404).json({
      success: false,
      message: 'Review not found for this order'
    });
  }

  res.status(200).json({
    success: true,
    data: review
  });
});

/**
 * @desc    Get customer's reviews
 * @route   GET /api/reviews/my-reviews
 * @access  Private (Customer)
 */
exports.getMyReviews = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;

  const reviews = await Review.find({ customerId: req.user._id })
    .populate('restaurantId', 'name images')
    .populate('orderId', 'orderNumber items totalAmount')
    .sort('-createdAt')
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Review.countDocuments({ customerId: req.user._id });

  res.status(200).json({
    success: true,
    data: {
      reviews,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
});

/**
 * @desc    Update a review
 * @route   PUT /api/reviews/:reviewId
 * @access  Private (Customer)
 */
exports.updateReview = asyncHandler(async (req, res) => {
  const { reviewId } = req.params;
  const { ratings, comment, images } = req.body;

  const review = await Review.findById(reviewId);

  if (!review) {
    return res.status(404).json({
      success: false,
      message: 'Review not found'
    });
  }

  // Check if review belongs to the user
  if (review.customerId.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'You can only update your own reviews'
    });
  }

  // Update fields
  if (ratings) {
    review.ratings = {
      food: ratings.food || review.ratings.food,
      delivery: ratings.delivery || review.ratings.delivery,
      overall: ratings.overall || review.ratings.overall
    };
  }
  if (comment !== undefined) review.comment = comment;
  if (images) review.images = images;

  await review.save();

  await review.populate([
    { path: 'customerId', select: 'name profilePicture' },
    { path: 'restaurantId', select: 'name' }
  ]);

  res.status(200).json({
    success: true,
    message: 'Review updated successfully',
    data: review
  });
});

/**
 * @desc    Delete a review
 * @route   DELETE /api/reviews/:reviewId
 * @access  Private (Customer)
 */
exports.deleteReview = asyncHandler(async (req, res) => {
  const { reviewId } = req.params;

  const review = await Review.findById(reviewId);

  if (!review) {
    return res.status(404).json({
      success: false,
      message: 'Review not found'
    });
  }

  // Check if review belongs to the user
  if (review.customerId.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'You can only delete your own reviews'
    });
  }

  await review.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Review deleted successfully'
  });
});

/**
 * @desc    Mark review as helpful
 * @route   POST /api/reviews/:reviewId/helpful
 * @access  Private
 */
exports.markHelpful = asyncHandler(async (req, res) => {
  const { reviewId } = req.params;

  const review = await Review.findByIdAndUpdate(
    reviewId,
    { $inc: { helpfulCount: 1 } },
    { new: true }
  );

  if (!review) {
    return res.status(404).json({
      success: false,
      message: 'Review not found'
    });
  }

  res.status(200).json({
    success: true,
    message: 'Review marked as helpful',
    data: { helpfulCount: review.helpfulCount }
  });
});

/**
 * @desc    Restaurant responds to review
 * @route   POST /api/reviews/:reviewId/respond
 * @access  Private (Vendor)
 */
exports.respondToReview = asyncHandler(async (req, res) => {
  const { reviewId } = req.params;
  const { comment } = req.body;

  const review = await Review.findById(reviewId);

  if (!review) {
    return res.status(404).json({
      success: false,
      message: 'Review not found'
    });
  }

  // Check if restaurant belongs to the vendor
  const restaurant = await Restaurant.findById(review.restaurantId);
  if (restaurant.ownerId.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'You can only respond to reviews for your restaurant'
    });
  }

  review.restaurantResponse = {
    comment,
    respondedAt: new Date(),
    respondedBy: req.user._id
  };

  await review.save();

  await review.populate([
    { path: 'customerId', select: 'name profilePicture' },
    { path: 'restaurantResponse.respondedBy', select: 'name' }
  ]);

  res.status(200).json({
    success: true,
    message: 'Response added successfully',
    data: review
  });
});

/**
 * @desc    Flag review
 * @route   POST /api/reviews/:reviewId/flag
 * @access  Private (Admin)
 */
exports.flagReview = asyncHandler(async (req, res) => {
  const { reviewId } = req.params;
  const { reason } = req.body;

  const review = await Review.findById(reviewId);

  if (!review) {
    return res.status(404).json({
      success: false,
      message: 'Review not found'
    });
  }

  review.isFlagged = true;
  review.flagReason = reason;
  await review.save();

  res.status(200).json({
    success: true,
    message: 'Review flagged successfully',
    data: review
  });
});
