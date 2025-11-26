const mongoose = require('mongoose');

const loyaltyTransactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    index: true
  },
  type: {
    type: String,
    enum: ['earned', 'redeemed', 'expired', 'bonus', 'referral'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  balanceAfter: {
    type: Number,
    required: true
  },
  expiresAt: {
    type: Date
  },
  metadata: {
    orderAmount: Number,
    earnRate: Number,
    referralCode: String,
    bonusReason: String
  }
}, {
  timestamps: true
});

// Indexes
loyaltyTransactionSchema.index({ userId: 1, createdAt: -1 });
loyaltyTransactionSchema.index({ type: 1 });
loyaltyTransactionSchema.index({ expiresAt: 1 });

module.exports = mongoose.model('LoyaltyTransaction', loyaltyTransactionSchema);
