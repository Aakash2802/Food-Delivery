const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth.middleware');
const loyaltyService = require('../services/loyaltyService');

// Get loyalty summary
router.get('/summary', authMiddleware, async (req, res) => {
  try {
    const result = await loyaltyService.getLoyaltySummary(req.user._id);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message
      });
    }

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error getting loyalty summary:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Redeem coins
router.post('/redeem', authMiddleware, async (req, res) => {
  try {
    const { coinsToRedeem } = req.body;

    if (!coinsToRedeem || coinsToRedeem <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid coins amount'
      });
    }

    const result = await loyaltyService.redeemCoins(req.user._id, coinsToRedeem);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message
      });
    }

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error redeeming coins:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get all transactions
router.get('/transactions', authMiddleware, async (req, res) => {
  try {
    const LoyaltyTransaction = require('../models/LoyaltyTransaction');

    const transactions = await LoyaltyTransaction.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      data: transactions
    });
  } catch (error) {
    console.error('Error getting transactions:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
