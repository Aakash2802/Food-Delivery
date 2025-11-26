const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/review.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
const { roleMiddleware } = require('../middleware/role.middleware');

// Public routes
router.get('/restaurant/:restaurantId', reviewController.getRestaurantReviews);
router.get('/order/:orderId', reviewController.getReviewByOrder);

// Customer routes
router.post('/', authMiddleware, roleMiddleware('customer'), reviewController.createReview);
router.get('/my-reviews', authMiddleware, roleMiddleware('customer'), reviewController.getMyReviews);
router.put('/:reviewId', authMiddleware, roleMiddleware('customer'), reviewController.updateReview);
router.delete('/:reviewId', authMiddleware, roleMiddleware('customer'), reviewController.deleteReview);

// Authenticated routes
router.post('/:reviewId/helpful', authMiddleware, reviewController.markHelpful);

// Vendor routes
router.post('/:reviewId/respond', authMiddleware, roleMiddleware('vendor'), reviewController.respondToReview);

// Admin routes
router.post('/:reviewId/flag', authMiddleware, roleMiddleware('admin'), reviewController.flagReview);

module.exports = router;
