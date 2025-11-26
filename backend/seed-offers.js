require('dotenv').config();
const mongoose = require('mongoose');
const Restaurant = require('./src/models/Restaurant');

// Sample offers
const sampleOffers = [
  {
    title: '50% OFF',
    description: 'Get 50% off on orders above ₹199',
    discountType: 'percentage',
    discountValue: 50,
    minOrderValue: 199,
    maxDiscount: 100,
    validFrom: new Date(),
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    isActive: true,
    code: 'SAVE50'
  },
  {
    title: 'FREE DELIVERY',
    description: 'Free delivery on all orders',
    discountType: 'freeDelivery',
    discountValue: 100,
    minOrderValue: 0,
    validFrom: new Date(),
    validUntil: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days
    isActive: true,
    code: 'FREEDEL'
  },
  {
    title: '₹100 OFF',
    description: 'Flat ₹100 off on orders above ₹299',
    discountType: 'flat',
    discountValue: 100,
    minOrderValue: 299,
    validFrom: new Date(),
    validUntil: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000), // 20 days
    isActive: true,
    code: 'FLAT100'
  },
  {
    title: '30% OFF',
    description: 'Get 30% off on orders above ₹149',
    discountType: 'percentage',
    discountValue: 30,
    minOrderValue: 149,
    maxDiscount: 75,
    validFrom: new Date(),
    validUntil: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days
    isActive: true,
    code: 'SAVE30'
  }
];

const seedOffers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('📦 Connected to MongoDB');

    // Get all restaurants
    const restaurants = await Restaurant.find({ isApproved: true });
    console.log(`Found ${restaurants.length} approved restaurants`);

    let updatedCount = 0;

    for (const restaurant of restaurants) {
      // Randomly assign 1-3 offers to each restaurant
      const numOffers = Math.floor(Math.random() * 3) + 1;
      const shuffled = [...sampleOffers].sort(() => 0.5 - Math.random());
      const selectedOffers = shuffled.slice(0, numOffers);

      restaurant.offers = selectedOffers;
      await restaurant.save();
      updatedCount++;
      console.log(`✅ Added ${numOffers} offer(s) to ${restaurant.name}`);
    }

    console.log(`\n✨ Successfully added offers to ${updatedCount} restaurants`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding offers:', error);
    process.exit(1);
  }
};

seedOffers();
