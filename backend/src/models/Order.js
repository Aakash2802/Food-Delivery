const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
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
    ref: 'User',
    default: null
  },
  items: [{
    menuItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MenuItem',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1']
    },
    price: {
      type: Number,
      required: true,
      min: [0, 'Price cannot be negative']
    },
    customizations: [{
      name: String,
      selectedOptions: [String],
      additionalPrice: {
        type: Number,
        default: 0
      }
    }],
    specialInstructions: String
  }],
  pricing: {
    subtotal: {
      type: Number,
      required: true,
      min: [0, 'Subtotal cannot be negative']
    },
    deliveryFee: {
      type: Number,
      default: 0,
      min: [0, 'Delivery fee cannot be negative']
    },
    taxes: {
      type: Number,
      default: 0,
      min: [0, 'Taxes cannot be negative']
    },
    discount: {
      type: Number,
      default: 0,
      min: [0, 'Discount cannot be negative']
    },
    platformFee: {
      type: Number,
      default: 0,
      min: [0, 'Platform fee cannot be negative']
    },
    total: {
      type: Number,
      required: true,
      min: [0, 'Total cannot be negative']
    }
  },
  deliveryAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    location: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point']
      },
      coordinates: {
        type: [Number],
        required: true
      }
    },
    instructions: String
  },
  contactPhone: {
    type: String,
    required: [true, 'Contact phone is required']
  },
  status: {
    type: String,
    enum: [
      'pending',
      'confirmed',
      'preparing',
      'ready',
      'assigned',
      'picked',
      'en_route',
      'delivered',
      'cancelled',
      'rejected'
    ],
    default: 'pending'
  },
  statusHistory: [{
    status: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    note: String
  }],
  paymentInfo: {
    method: {
      type: String,
      enum: ['cod', 'card', 'upi', 'wallet', 'razorpay', 'mock'],
      required: [true, 'Payment method is required']
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending'
    },
    transactionId: String,
    paymentGateway: {
      type: String,
      enum: ['razorpay', 'stripe', 'mock']
    },
    gatewayOrderId: String,
    paidAt: Date
  },
  promoCode: {
    code: String,
    discount: {
      type: Number,
      default: 0
    }
  },
  estimatedDeliveryTime: Date,
  actualDeliveryTime: Date,
  preparationTime: {
    type: Number,
    default: 0
  },
  distance: {
    type: Number, // Distance in kilometers
    default: 0
  },
  commission: {
    rate: {
      type: Number,
      default: 0
    },
    amount: {
      type: Number,
      default: 0
    }
  },
  review: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review'
  },
  cancellationReason: String,
  refundAmount: {
    type: Number,
    default: 0
  },
  scheduledFor: Date
}, {
  timestamps: true
});

// Indexes
// Note: orderNumber already has unique index from schema definition
orderSchema.index({ customerId: 1, createdAt: -1 });
orderSchema.index({ restaurantId: 1, status: 1 });
orderSchema.index({ driverId: 1, status: 1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ 'deliveryAddress.location': '2dsphere' });

// Generate unique order number
orderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.orderNumber = `ORD${timestamp}${random}`;
  }

  // Add to status history
  if (this.isModified('status')) {
    this.statusHistory.push({
      status: this.status,
      timestamp: new Date()
    });
  }

  next();
});

// Virtual to check if order can be cancelled
orderSchema.virtual('canBeCancelled').get(function() {
  return ['pending', 'confirmed', 'preparing'].includes(this.status);
});

// Virtual to check if order is active
orderSchema.virtual('isActive').get(function() {
  return !['delivered', 'cancelled', 'rejected'].includes(this.status);
});

// Method to calculate delivery time
orderSchema.methods.calculateDeliveryTime = function(preparationMinutes = 0, travelMinutes = 0) {
  const now = new Date();
  const totalMinutes = preparationMinutes + travelMinutes;
  this.estimatedDeliveryTime = new Date(now.getTime() + totalMinutes * 60000);
  return this.estimatedDeliveryTime;
};

// Method to update status
orderSchema.methods.updateStatus = async function(newStatus, updatedBy = null, note = null) {
  this.status = newStatus;
  this.statusHistory.push({
    status: newStatus,
    timestamp: new Date(),
    updatedBy,
    note
  });
  await this.save();
};

// Ensure toJSON includes virtuals
orderSchema.set('toJSON', { virtuals: true });
orderSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Order', orderSchema);
