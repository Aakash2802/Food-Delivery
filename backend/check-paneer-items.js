const mongoose = require('mongoose');
const MenuItem = require('./src/models/MenuItem');

async function checkPaneerItems() {
  try {
    await mongoose.connect('mongodb://localhost:27017/food-delivery');
    console.log('✅ Connected to database\n');

    // Find all Paneer Butter Masala and Paniyaram items
    const items = await MenuItem.find({
      $or: [
        { name: /paneer butter masala/i },
        { name: /paniyaram/i }
      ]
    });

    console.log(`Found ${items.length} items:\n`);

    // Get Restaurant model to lookup restaurant names
    const Restaurant = require('./src/models/Restaurant');

    for (const item of items) {
      const restaurant = await Restaurant.findById(item.restaurantId);
      console.log(`📝 Name: ${item.name}`);
      console.log(`   Price: ₹${item.price}`);
      console.log(`   Restaurant: ${restaurant ? restaurant.name : 'Unknown'}`);
      console.log(`   Restaurant ID: ${item.restaurantId}`);
      console.log(`   Item ID: ${item._id}`);
      console.log(`   Veg: ${item.isVeg ? 'Yes 🌱' : 'No'}\n`);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkPaneerItems();
