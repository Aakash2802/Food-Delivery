require('dotenv').config();
const mongoose = require('mongoose');
const { awardCoinsForOrder } = require('./src/services/loyaltyService');
const PromoCode = require('./src/models/PromoCode');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/food-delivery';

async function awardLoyaltyAndCreatePromos() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Award loyalty coins for existing delivered order
    const userId = '691317b534a933968d33afa6';
    const orderId = '691563c8a3f37076d66b1908';
    const orderAmount = 811.6;

    console.log('\n📝 Awarding loyalty coins for delivered order...');
    const loyaltyResult = await awardCoinsForOrder(userId, orderId, orderAmount);

    if (loyaltyResult.success) {
      console.log(`✅ Awarded ${loyaltyResult.coinsAwarded} coins!`);
      console.log(`   New balance: ${loyaltyResult.newBalance} coins`);
      console.log(`   Tier: ${loyaltyResult.tier}`);
    } else {
      console.log(`❌ Failed: ${loyaltyResult.message}`);
    }

    // Create promo codes
    console.log('\n📝 Creating promo codes...');

    const promoCodes = [
      {
        code: 'WELCOME50',
        description: 'Welcome discount - ₹50 off on orders above ₹200',
        type: 'fixed',
        value: 50,
        minOrderValue: 200,
        maxDiscount: 50,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
        usageLimit: { total: 1000, perUser: 3 },
        isActive: true,
        applicableFor: 'all'
      },
      {
        code: 'SAVE100',
        description: 'Save ₹100 on orders above ₹500',
        type: 'fixed',
        value: 100,
        minOrderValue: 500,
        maxDiscount: 100,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
        usageLimit: { total: 500, perUser: 2 },
        isActive: true,
        applicableFor: 'all'
      },
      {
        code: 'PERCENT20',
        description: '20% off on orders above ₹300',
        type: 'percentage',
        value: 20,
        minOrderValue: 300,
        maxDiscount: 200,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        usageLimit: { total: 1000, perUser: 5 },
        isActive: true,
        applicableFor: 'all'
      },
      {
        code: 'FIRSTORDER',
        description: 'First order special - ₹75 off',
        type: 'fixed',
        value: 75,
        minOrderValue: 150,
        maxDiscount: 75,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        usageLimit: { total: 10000, perUser: 1 },
        isActive: true,
        applicableFor: 'all'
      },
      {
        code: 'BIGSAVE',
        description: 'Big savings - ₹200 off on orders above ₹1000',
        type: 'fixed',
        value: 200,
        minOrderValue: 1000,
        maxDiscount: 200,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days
        usageLimit: { total: 200, perUser: 1 },
        isActive: true,
        applicableFor: 'all'
      }
    ];

    for (const promoData of promoCodes) {
      // Check if promo code already exists
      const existing = await PromoCode.findOne({ code: promoData.code });
      if (existing) {
        console.log(`⚠️  Promo code ${promoData.code} already exists`);
        continue;
      }

      const promo = await PromoCode.create(promoData);
      console.log(`✅ Created promo code: ${promo.code} - ${promo.description}`);
    }

    console.log('\n✅ Done! All promo codes created successfully.');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 Disconnected from MongoDB');
  }
}

awardLoyaltyAndCreatePromos();
