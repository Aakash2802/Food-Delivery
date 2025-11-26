const mongoose = require('mongoose');
const User = require('./src/models/User');
const Restaurant = require('./src/models/Restaurant');

async function checkDemoVendor() {
  try {
    await mongoose.connect('mongodb://localhost:27017/food-delivery');
    console.log('✅ Connected to database\n');

    // Find demo vendor
    const demoVendor = await User.findOne({ email: /demo.*vendor/i, role: 'vendor' });

    if (!demoVendor) {
      console.log('❌ Demo vendor not found');

      // List all vendors
      const vendors = await User.find({ role: 'vendor' });
      console.log(`\n📋 Found ${vendors.length} vendors:\n`);
      vendors.forEach(vendor => {
        console.log(`  Email: ${vendor.email}`);
        console.log(`  Name: ${vendor.name}`);
        console.log(`  Restaurant: ${vendor.restaurant}\n`);
      });
    } else {
      console.log('👤 Demo Vendor Found:');
      console.log(`  Email: ${demoVendor.email}`);
      console.log(`  Name: ${demoVendor.name}`);
      console.log(`  Restaurant ID: ${demoVendor.restaurant}`);

      if (demoVendor.restaurant) {
        const restaurant = await Restaurant.findById(demoVendor.restaurant);
        if (restaurant) {
          console.log(`\n🏪 Restaurant Details:`);
          console.log(`  Name: ${restaurant.name}`);
          console.log(`  ID: ${restaurant._id}`);
          console.log(`  Address: ${restaurant.address?.street || 'N/A'}`);
          console.log(`  City: ${restaurant.address?.city || 'N/A'}`);
        } else {
          console.log(`\n❌ Restaurant not found with ID: ${demoVendor.restaurant}`);
        }
      } else {
        console.log(`\n⚠️  No restaurant linked to this vendor`);
      }
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkDemoVendor();
