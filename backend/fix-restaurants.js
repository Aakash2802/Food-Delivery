const mongoose = require('mongoose');
require('dotenv').config();
const Restaurant = require('./src/models/Restaurant');

const fixRestaurants = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Set all restaurants to open
    const result = await Restaurant.updateMany({}, {
      $set: {
        isOpen: true,
        isActive: true,
        isApproved: true
      }
    });

    console.log('Updated restaurants:', result.modifiedCount);

    // Display all restaurants
    const restaurants = await Restaurant.find({}).select('name isOpen isActive isApproved');
    console.log('\nRestaurants status:');
    restaurants.forEach(r => {
      console.log(`${r.name}: Open=${r.isOpen}, Active=${r.isActive}, Approved=${r.isApproved}`);
    });

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

fixRestaurants();
