const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: [true, 'Order ID is required'],
    unique: true
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Customer ID is required']
  },
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: [true, 'Restaurant ID is required']
  },
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  ratings: {
    food: {
      type: Number,
      required: [true, 'Food rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5']
    },
    delivery: {
      type: Number,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5']
    },
    overall: {
      type: Number,
      required: [true, 'Overall rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5']
    }
  },
  comment: {
    type: String,
    maxlength: [1000, 'Comment cannot exceed 1000 characters']
  },
  images: [{
    type: String,
    trim: true
  }],
  isPublished: {
    type: Boolean,
    default: true
  },
  helpfulCount: {
    type: Number,
    default: 0,
    min: [0, 'Helpful count cannot be negative']
  },
  restaurantResponse: {
    comment: {
      type: String,
      maxlength: [500, 'Response cannot exceed 500 characters']
    },
    respondedAt: Date,
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  isFlagged: {
    type: Boolean,
    default: false
  },
  flagReason: String
}, {
  timestamps: true
});

// Indexes
reviewSchema.index({ restaurantId: 1, isPublished: 1, createdAt: -1 });
reviewSchema.index({ customerId: 1 });
reviewSchema.index({ orderId: 1 });
reviewSchema.index({ driverId: 1 });
reviewSchema.index({ 'ratings.overall': -1 });

// Post-save hook to update restaurant rating
reviewSchema.post('save', async function() {
  const Restaurant = mongoose.model('Restaurant');

  try {
    const restaurant = await Restaurant.findById(this.restaurantId);
    if (restaurant) {
      await restaurant.updateRating(this.ratings.overall);
    }
  } catch (error) {
    console.error('Error updating restaurant rating:', error);
  }
});

module.exports = mongoose.model('Review', reviewSchema);
