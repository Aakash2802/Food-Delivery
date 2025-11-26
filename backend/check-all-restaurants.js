const mongoose = require('mongoose');
const Restaurant = require('./src/models/Restaurant');

async function checkAllRestaurants() {
  try {
    await mongoose.connect('mongodb://localhost:27017/food-delivery');
    console.log('✅ Connected to database\n');

    // Find all restaurants
    const restaurants = await Restaurant.find({}).sort({ createdAt: -1 });

    console.log(`📋 Found ${restaurants.length} restaurants:\n`);

    restaurants.forEach((restaurant, index) => {
      console.log(`${index + 1}. ${restaurant.name}`);
      console.log(`   ID: ${restaurant._id}`);
      console.log(`   Cuisine: ${restaurant.cuisineType || 'N/A'}`);
      console.log(`   Address: ${restaurant.address?.street || 'N/A'}`);
      console.log(`   Created: ${restaurant.createdAt}\n`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkAllRestaurants();
