const mongoose = require('mongoose');

const promoCodeSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'Promo code is required'],
    unique: true,
    uppercase: true,
    trim: true,
    maxlength: [50, 'Code cannot exceed 50 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  type: {
    type: String,
    enum: ['percentage', 'fixed'],
    required: [true, 'Discount type is required']
  },
  value: {
    type: Number,
    required: [true, 'Discount value is required'],
    min: [0, 'Value cannot be negative']
  },
  maxDiscount: {
    type: Number,
    min: [0, 'Max discount cannot be negative']
  },
  minOrderValue: {
    type: Number,
    default: 0,
    min: [0, 'Minimum order value cannot be negative']
  },
  applicableFor: {
    type: String,
    enum: ['all', 'new_users', 'specific_restaurants'],
    default: 'all'
  },
  restaurants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant'
  }],
  validFrom: {
    type: Date,
    required: [true, 'Valid from date is required']
  },
  validUntil: {
    type: Date,
    required: [true, 'Valid until date is required']
  },
  usageLimit: {
    total: {
      type: Number,
      min: [1, 'Total usage limit must be at least 1']
    },
    perUser: {
      type: Number,
      default: 1,
      min: [1, 'Per user limit must be at least 1']
    }
  },
  usageCount: {
    type: Number,
    default: 0,
    min: [0, 'Usage count cannot be negative']
  },
  usedBy: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    count: {
      type: Number,
      default: 1
    },
    lastUsedAt: Date
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Pre-save validation hook
promoCodeSchema.pre('save', function(next) {
  if (this.validUntil && this.validFrom && this.validUntil <= this.validFrom) {
    const error = new Error('Valid until date must be after valid from date');
    return next(error);
  }
  next();
});

// Pre-update validation hook
promoCodeSchema.pre('findOneAndUpdate', function(next) {
  const update = this.getUpdate();
  const validFrom = update.validFrom || update.$set?.validFrom;
  const validUntil = update.validUntil || update.$set?.validUntil;

  if (validFrom && validUntil && new Date(validUntil) <= new Date(validFrom)) {
    const error = new Error('Valid until date must be after valid from date');
    return next(error);
  }
  next();
});

// Indexes
promoCodeSchema.index({ code: 1 });
promoCodeSchema.index({ isActive: 1, validFrom: 1, validUntil: 1 });
promoCodeSchema.index({ 'usedBy.userId': 1 });

// Method to check if promo is valid for user
promoCodeSchema.methods.isValidFor = function(userId, orderValue, restaurantId) {
  const now = new Date();

  // Check if active
  if (!this.isActive) {
    return { valid: false, message: 'Promo code is inactive' };
  }

  // Check date validity
  if (now < this.validFrom || now > this.validUntil) {
    return { valid: false, message: 'Promo code has expired' };
  }

  // Check minimum order value
  if (orderValue < this.minOrderValue) {
    return {
      valid: false,
      message: `Minimum order value of ₹${this.minOrderValue} required`
    };
  }

  // Check total usage limit
  if (this.usageLimit.total && this.usageCount >= this.usageLimit.total) {
    return { valid: false, message: 'Promo code usage limit reached' };
  }

  // Check per-user usage limit
  if (userId) {
    const userUsage = this.usedBy.find(u => u.userId.toString() === userId.toString());
    if (userUsage && userUsage.count >= this.usageLimit.perUser) {
      return { valid: false, message: 'You have already used this promo code' };
    }
  }

  // Check restaurant applicability
  if (this.applicableFor === 'specific_restaurants') {
    if (!this.restaurants.some(r => r.toString() === restaurantId.toString())) {
      return { valid: false, message: 'Promo code not applicable for this restaurant' };
    }
  }

  return { valid: true };
};

// Method to calculate discount
promoCodeSchema.methods.calculateDiscount = function(orderValue) {
  if (this.type === 'percentage') {
    const discount = (orderValue * this.value) / 100;
    return this.maxDiscount ? Math.min(discount, this.maxDiscount) : discount;
  } else {
    return Math.min(this.value, orderValue);
  }
};

// Method to increment usage
promoCodeSchema.methods.incrementUsage = async function(userId) {
  this.usageCount += 1;

  if (userId) {
    const userUsageIndex = this.usedBy.findIndex(u => u.userId.toString() === userId.toString());

    if (userUsageIndex > -1) {
      this.usedBy[userUsageIndex].count += 1;
      this.usedBy[userUsageIndex].lastUsedAt = new Date();
    } else {
      this.usedBy.push({
        userId,
        count: 1,
        lastUsedAt: new Date()
      });
    }
  }

  await this.save();
};

module.exports = mongoose.model('PromoCode', promoCodeSchema);
