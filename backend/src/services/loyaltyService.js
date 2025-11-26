const User = require('../models/User');
const LoyaltyTransaction = require('../models/LoyaltyTransaction');

// Loyalty configuration
const LOYALTY_CONFIG = {
  EARN_RATE: 0.05, // 5% of order value
  MIN_ORDER_FOR_COINS: 100, // Minimum order value to earn coins
  COIN_VALUE: 1, // 1 coin = ₹1
  TIER_THRESHOLDS: {
    bronze: 0,
    silver: 500,
    gold: 2000,
    platinum: 5000
  },
  TIER_MULTIPLIERS: {
    bronze: 1,
    silver: 1.25,
    gold: 1.5,
    platinum: 2
  },
  COINS_EXPIRY_DAYS: 365 // Coins expire after 1 year
};

// Calculate tier based on total earned points
const calculateTier = (totalEarned) => {
  if (totalEarned >= LOYALTY_CONFIG.TIER_THRESHOLDS.platinum) return 'platinum';
  if (totalEarned >= LOYALTY_CONFIG.TIER_THRESHOLDS.gold) return 'gold';
  if (totalEarned >= LOYALTY_CONFIG.TIER_THRESHOLDS.silver) return 'silver';
  return 'bronze';
};

// Award coins for order
const awardCoinsForOrder = async (userId, orderId, orderAmount) => {
  try {
    // Check if order amount qualifies for coins
    if (orderAmount < LOYALTY_CONFIG.MIN_ORDER_FOR_COINS) {
      return { success: false, message: 'Order amount too low to earn coins' };
    }

    // Get user
    const user = await User.findById(userId);
    if (!user || user.role !== 'customer') {
      return { success: false, message: 'Invalid user' };
    }

    // Calculate coins to award (with tier multiplier)
    const tierMultiplier = LOYALTY_CONFIG.TIER_MULTIPLIERS[user.loyaltyPoints.tier] || 1;
    const baseCoins = Math.floor(orderAmount * LOYALTY_CONFIG.EARN_RATE);
    const coinsToAward = Math.floor(baseCoins * tierMultiplier);

    // Update user loyalty points
    user.loyaltyPoints.balance += coinsToAward;
    user.loyaltyPoints.totalEarned += coinsToAward;
    user.loyaltyPoints.lastUpdated = new Date();

    // Update tier
    user.loyaltyPoints.tier = calculateTier(user.loyaltyPoints.totalEarned);

    await user.save();

    // Create transaction record
    const transaction = await LoyaltyTransaction.create({
      userId,
      orderId,
      type: 'earned',
      amount: coinsToAward,
      description: `Earned ${coinsToAward} coins from order`,
      balanceAfter: user.loyaltyPoints.balance,
      expiresAt: new Date(Date.now() + LOYALTY_CONFIG.COINS_EXPIRY_DAYS * 24 * 60 * 60 * 1000),
      metadata: {
        orderAmount,
        earnRate: LOYALTY_CONFIG.EARN_RATE * tierMultiplier
      }
    });

    return {
      success: true,
      coinsAwarded: coinsToAward,
      newBalance: user.loyaltyPoints.balance,
      tier: user.loyaltyPoints.tier,
      transaction
    };
  } catch (error) {
    console.error('Error awarding coins:', error);
    return { success: false, message: error.message };
  }
};

// Redeem coins
const redeemCoins = async (userId, coinsToRedeem) => {
  try {
    // Get user
    const user = await User.findById(userId);
    if (!user || user.role !== 'customer') {
      return { success: false, message: 'Invalid user' };
    }

    // Check if user has enough coins
    if (user.loyaltyPoints.balance < coinsToRedeem) {
      return { success: false, message: 'Insufficient coins' };
    }

    // Update user loyalty points
    user.loyaltyPoints.balance -= coinsToRedeem;
    user.loyaltyPoints.totalRedeemed += coinsToRedeem;
    user.loyaltyPoints.lastUpdated = new Date();

    await user.save();

    // Create transaction record
    const transaction = await LoyaltyTransaction.create({
      userId,
      type: 'redeemed',
      amount: -coinsToRedeem,
      description: `Redeemed ${coinsToRedeem} coins`,
      balanceAfter: user.loyaltyPoints.balance
    });

    return {
      success: true,
      coinsRedeemed: coinsToRedeem,
      discountAmount: coinsToRedeem * LOYALTY_CONFIG.COIN_VALUE,
      newBalance: user.loyaltyPoints.balance,
      transaction
    };
  } catch (error) {
    console.error('Error redeeming coins:', error);
    return { success: false, message: error.message };
  }
};

// Award bonus coins
const awardBonusCoins = async (userId, amount, reason) => {
  try {
    const user = await User.findById(userId);
    if (!user || user.role !== 'customer') {
      return { success: false, message: 'Invalid user' };
    }

    user.loyaltyPoints.balance += amount;
    user.loyaltyPoints.totalEarned += amount;
    user.loyaltyPoints.lastUpdated = new Date();
    user.loyaltyPoints.tier = calculateTier(user.loyaltyPoints.totalEarned);

    await user.save();

    const transaction = await LoyaltyTransaction.create({
      userId,
      type: 'bonus',
      amount,
      description: `Bonus: ${reason}`,
      balanceAfter: user.loyaltyPoints.balance,
      metadata: { bonusReason: reason }
    });

    return {
      success: true,
      coinsAwarded: amount,
      newBalance: user.loyaltyPoints.balance,
      tier: user.loyaltyPoints.tier,
      transaction
    };
  } catch (error) {
    console.error('Error awarding bonus coins:', error);
    return { success: false, message: error.message };
  }
};

// Get loyalty summary
const getLoyaltySummary = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      return { success: false, message: 'User not found' };
    }

    const recentTransactions = await LoyaltyTransaction.find({ userId })
      .sort({ createdAt: -1 })
      .limit(10);

    const currentTier = user.loyaltyPoints.tier;
    const nextTierThreshold =
      currentTier === 'platinum' ? null :
      currentTier === 'gold' ? LOYALTY_CONFIG.TIER_THRESHOLDS.platinum :
      currentTier === 'silver' ? LOYALTY_CONFIG.TIER_THRESHOLDS.gold :
      LOYALTY_CONFIG.TIER_THRESHOLDS.silver;

    const pointsToNextTier = nextTierThreshold
      ? nextTierThreshold - user.loyaltyPoints.totalEarned
      : 0;

    return {
      success: true,
      loyalty: {
        balance: user.loyaltyPoints.balance,
        totalEarned: user.loyaltyPoints.totalEarned,
        totalRedeemed: user.loyaltyPoints.totalRedeemed,
        tier: currentTier,
        tierMultiplier: LOYALTY_CONFIG.TIER_MULTIPLIERS[currentTier],
        nextTier: currentTier === 'platinum' ? null :
          currentTier === 'gold' ? 'platinum' :
          currentTier === 'silver' ? 'gold' : 'silver',
        pointsToNextTier,
        coinValue: LOYALTY_CONFIG.COIN_VALUE
      },
      recentTransactions,
      config: {
        earnRate: LOYALTY_CONFIG.EARN_RATE,
        minOrderForCoins: LOYALTY_CONFIG.MIN_ORDER_FOR_COINS,
        coinValue: LOYALTY_CONFIG.COIN_VALUE
      }
    };
  } catch (error) {
    console.error('Error getting loyalty summary:', error);
    return { success: false, message: error.message };
  }
};

module.exports = {
  LOYALTY_CONFIG,
  awardCoinsForOrder,
  redeemCoins,
  awardBonusCoins,
  getLoyaltySummary,
  calculateTier
};
