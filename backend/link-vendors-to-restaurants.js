const mongoose = require('mongoose');
const User = require('./src/models/User');
const Restaurant = require('./src/models/Restaurant');

async function linkVendorsToRestaurants() {
  try {
    await mongoose.connect('mongodb://localhost:27017/food-delivery');
    console.log('✅ Connected to database\n');

    // Mapping of vendor emails to restaurant names
    const vendorRestaurantMapping = {
      'meenakshi@vendor.com': 'Meenakshi Bhavan',
      'annapoorna@vendor.com': 'Annapoorna Gowrishankar',
      'kurinji@vendor.com': 'Kurinji Biryani House',
      'temple@vendor.com': 'Temple City Cafe',
      'pandian@vendor.com': 'Pandian Hotel'
    };

    let linkedCount = 0;

    for (const [vendorEmail, restaurantName] of Object.entries(vendorRestaurantMapping)) {
      // Find the vendor
      const vendor = await User.findOne({ email: vendorEmail, role: 'vendor' });

      if (!vendor) {
        console.log(`⚠️  Vendor not found: ${vendorEmail}`);
        continue;
      }

      // Find the restaurant
      const restaurant = await Restaurant.findOne({ name: restaurantName });

      if (!restaurant) {
        console.log(`⚠️  Restaurant not found: ${restaurantName}`);
        continue;
      }

      // Link vendor to restaurant
      vendor.restaurantId = restaurant._id;
      await vendor.save();

      // Also update restaurant owner if needed
      if (!restaurant.owner || restaurant.owner.toString() !== vendor._id.toString()) {
        restaurant.owner = vendor._id;
        await restaurant.save();
      }

      linkedCount++;
      console.log(`✓ Linked ${vendor.name} (${vendorEmail}) → ${restaurantName}`);
    }

    console.log(`\n✅ Successfully linked ${linkedCount} vendors to their restaurants`);

    // Verify the links
    console.log('\n📋 Verification:\n');
    const vendors = await User.find({ role: 'vendor', restaurantId: { $exists: true, $ne: null } });

    for (const vendor of vendors) {
      const restaurant = await Restaurant.findById(vendor.restaurantId);
      console.log(`  ${vendor.email} → ${restaurant ? restaurant.name : 'Not found'}`);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

linkVendorsToRestaurants();
