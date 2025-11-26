const mongoose = require('mongoose');
const Restaurant = require('./src/models/Restaurant');

async function checkOffers() {
  try {
    await mongoose.connect('mongodb://localhost:27017/food-delivery');
    console.log('✅ Connected to database\n');

    const restaurants = await Restaurant.find({}).select('name offers');

    console.log('📋 Restaurants and their offers:\n');
    restaurants.forEach(restaurant => {
      console.log(`\n🏪 ${restaurant.name}`);
      if (restaurant.offers && restaurant.offers.length > 0) {
        restaurant.offers.forEach((offer, idx) => {
          console.log(`  ${idx + 1}. ${offer.title} - Code: ${offer.code}`);
          console.log(`     ${offer.description}`);
        });
      } else {
        console.log('  ❌ No offers');
      }
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkOffers();
