const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Restaurant name is required'],
    trim: true,
    maxlength: [200, 'Name cannot exceed 200 characters']
  },
  description: {
    type: String,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Owner is required']
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  cuisines: [{
    type: String,
    trim: true
  }],
  location: {
    street: String,
    city: {
      type: String,
      required: [true, 'City is required']
    },
    state: String,
    zipCode: String,
    country: {
      type: String,
      default: 'India'
    },
    coordinates: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point']
      },
      coordinates: {
        type: [Number],
        required: [true, 'Coordinates are required'],
        validate: {
          validator: function(value) {
            return value.length === 2 &&
                   value[0] >= -180 && value[0] <= 180 &&
                   value[1] >= -90 && value[1] <= 90;
          },
          message: 'Invalid coordinates [longitude, latitude]'
        }
      }
    }
  },
  contactInfo: {
    phone: {
      type: String,
      required: [true, 'Contact phone is required']
    },
    email: {
      type: String,
      lowercase: true
    }
  },
  openingHours: [{
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      required: true
    },
    open: {
      type: String,
      required: true,
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)']
    },
    close: {
      type: String,
      required: true,
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)']
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isOpen: {
    type: Boolean,
    default: false
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  pricing: {
    type: String,
    enum: ['$', '$$', '$$$', '$$$$'],
    default: '$$'
  },
  deliveryTime: {
    min: {
      type: Number,
      required: [true, 'Minimum delivery time is required'],
      min: [10, 'Minimum delivery time must be at least 10 minutes']
    },
    max: {
      type: Number,
      required: [true, 'Maximum delivery time is required'],
      validate: {
        validator: function(value) {
          return value > this.deliveryTime.min;
        },
        message: 'Maximum delivery time must be greater than minimum'
      }
    }
  },
  deliveryFee: {
    type: Number,
    default: 0,
    min: [0, 'Delivery fee cannot be negative']
  },
  minimumOrder: {
    type: Number,
    default: 0,
    min: [0, 'Minimum order cannot be negative']
  },
  commissionRate: {
    type: Number,
    default: 15,
    min: [0, 'Commission rate cannot be negative'],
    max: [100, 'Commission rate cannot exceed 100%']
  },
  tags: [{
    type: String,
    trim: true
  }],
  offers: [{
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    discountType: {
      type: String,
      enum: ['percentage', 'flat', 'freeDelivery'],
      required: true
    },
    discountValue: {
      type: Number,
      required: true,
      min: 0
    },
    minOrderValue: {
      type: Number,
      default: 0
    },
    maxDiscount: {
      type: Number,
      default: null
    },
    validFrom: {
      type: Date,
      default: Date.now
    },
    validUntil: {
      type: Date,
      required: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    usageLimit: {
      type: Number,
      default: null
    },
    usedCount: {
      type: Number,
      default: 0
    },
    code: {
      type: String,
      trim: true,
      uppercase: true
    }
  }],
  preparationCapacity: {
    type: Number,
    default: 10,
    min: [1, 'Preparation capacity must be at least 1']
  },
  currentOrdersCount: {
    type: Number,
    default: 0
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  approvedAt: Date,
  rejectionReason: String
}, {
  timestamps: true
});

// Indexes
restaurantSchema.index({ 'location.coordinates': '2dsphere' });
restaurantSchema.index({ name: 'text', cuisines: 'text', tags: 'text' });
restaurantSchema.index({ isActive: 1, isOpen: 1 });
restaurantSchema.index({ 'rating.average': -1 });
restaurantSchema.index({ ownerId: 1 });
restaurantSchema.index({ city: 1 });

// Ensure only one primary image
restaurantSchema.pre('save', function(next) {
  if (this.images && this.images.length > 0) {
    const primaryImages = this.images.filter(img => img.isPrimary);

    if (primaryImages.length === 0) {
      this.images[0].isPrimary = true;
    } else if (primaryImages.length > 1) {
      this.images.forEach((img, index) => {
        img.isPrimary = index === 0;
      });
    }
  }
  next();
});

// Virtual for checking if restaurant can accept more orders
restaurantSchema.virtual('canAcceptOrders').get(function() {
  return this.isActive &&
         this.isOpen &&
         this.isApproved &&
         this.currentOrdersCount < this.preparationCapacity;
});

// Update rating method
restaurantSchema.methods.updateRating = async function(newRating) {
  const totalRating = (this.rating.average * this.rating.count) + newRating;
  this.rating.count += 1;
  this.rating.average = totalRating / this.rating.count;
  await this.save();
};

module.exports = mongoose.model('Restaurant', restaurantSchema);
