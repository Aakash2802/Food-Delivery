const mongoose = require('mongoose');
const User = require('./src/models/User');
const Restaurant = require('./src/models/Restaurant');

mongoose.connect('mongodb://localhost:27017/food-delivery').then(async () => {
  console.log('✅ Connected to database\n');

  // Get all vendors
  const vendors = await User.find({ role: 'vendor' }).select('name email phone');

  console.log('📋 ALL VENDOR ACCOUNTS:\n');
  console.log('=' .repeat(80));

  for (const vendor of vendors) {
    // Get restaurant for this vendor
    const restaurant = await Restaurant.findOne({ ownerId: vendor._id });

    console.log(`\n👤 Vendor: ${vendor.name}`);
    console.log(`   Email: ${vendor.email}`);
    console.log(`   Phone: ${vendor.phone}`);
    console.log(`   Password: Vendor@123`);

    if (restaurant) {
      console.log(`   Restaurant: ${restaurant.name}`);
      console.log(`   Approved: ${restaurant.isApproved ? 'YES ✅' : 'NO ❌'}`);
      console.log(`   Status: ${restaurant.status}`);
    } else {
      console.log(`   Restaurant: Not created yet`);
    }

    console.log('   ' + '-'.repeat(70));
  }

  console.log('\n' + '='.repeat(80));
  console.log('\n📝 NOTE: All demo vendor passwords are: Vendor@123');
  console.log('\n🔄 ORDER FLOW:');
  console.log('   1. Customer places order → Status: PENDING');
  console.log('   2. Vendor confirms order → Status: CONFIRMED');
  console.log('   3. Vendor prepares food → Status: PREPARING');
  console.log('   4. Vendor marks ready → Status: READY');
  console.log('   5. Driver accepts order → Status: ASSIGNED');
  console.log('   6. Driver picks up → Status: PICKED_UP');
  console.log('   7. Driver delivers → Status: DELIVERED');
  console.log('\n');

  process.exit(0);
}).catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
