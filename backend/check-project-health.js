const mongoose = require('mongoose');
const Restaurant = require('./src/models/Restaurant');
const MenuItem = require('./src/models/MenuItem');
const User = require('./src/models/User');
const Order = require('./src/models/Order');

async function checkProjectHealth() {
  try {
    await mongoose.connect('mongodb://localhost:27017/food-delivery');
    console.log('✅ Connected to database\n');

    console.log('🔍 PROJECT HEALTH CHECK\n');
    console.log('='.repeat(60));

    // 1. Check Restaurants
    console.log('\n📊 RESTAURANTS:');
    const restaurants = await Restaurant.find({});
    console.log(`   Total: ${restaurants.length}`);

    const activeRestaurants = restaurants.filter(r => r.isActive);
    const approvedRestaurants = restaurants.filter(r => r.isApproved);
    console.log(`   Active: ${activeRestaurants.length}`);
    console.log(`   Approved: ${approvedRestaurants.length}`);

    restaurants.forEach(r => {
      console.log(`   - ${r.name} (${r.isActive ? '✓ Active' : '✗ Inactive'}, ${r.isApproved ? '✓ Approved' : '✗ Not Approved'})`);
    });

    // 2. Check Menu Items
    console.log('\n📊 MENU ITEMS:');
    const menuItems = await MenuItem.find({});
    console.log(`   Total: ${menuItems.length}`);

    const itemsWithoutImages = menuItems.filter(item => !item.images || item.images.length === 0);
    const itemsWithImages = menuItems.filter(item => item.images && item.images.length > 0);

    console.log(`   With Images: ${itemsWithImages.length}`);
    console.log(`   Without Images: ${itemsWithoutImages.length}`);

    if (itemsWithoutImages.length > 0) {
      console.log('\n   ⚠️  Items without images:');
      itemsWithoutImages.forEach(item => {
        console.log(`      - ${item.name}`);
      });
    }

    // Group by restaurant
    const itemsByRestaurant = {};
    for (const item of menuItems) {
      const restaurant = await Restaurant.findById(item.restaurantId);
      const restName = restaurant ? restaurant.name : 'Unknown';
      if (!itemsByRestaurant[restName]) itemsByRestaurant[restName] = 0;
      itemsByRestaurant[restName]++;
    }

    console.log('\n   Menu Items by Restaurant:');
    Object.entries(itemsByRestaurant).forEach(([name, count]) => {
      console.log(`      - ${name}: ${count} items`);
    });

    // 3. Check Vendors
    console.log('\n📊 VENDORS:');
    const vendors = await User.find({ role: 'vendor' });
    console.log(`   Total: ${vendors.length}`);

    const linkedVendors = vendors.filter(v => v.restaurantId);
    const unlinkedVendors = vendors.filter(v => !v.restaurantId);

    console.log(`   Linked to restaurants: ${linkedVendors.length}`);
    console.log(`   Not linked: ${unlinkedVendors.length}`);

    if (unlinkedVendors.length > 0) {
      console.log('\n   ⚠️  Unlinked vendors:');
      unlinkedVendors.forEach(v => {
        console.log(`      - ${v.email} (${v.name})`);
      });
    }

    // 4. Check Customers
    console.log('\n📊 CUSTOMERS:');
    const customers = await User.find({ role: 'customer' });
    console.log(`   Total: ${customers.length}`);

    // 5. Check Drivers
    console.log('\n📊 DRIVERS:');
    const drivers = await User.find({ role: 'driver' });
    console.log(`   Total: ${drivers.length}`);
    const availableDrivers = drivers.filter(d => d.isAvailable);
    console.log(`   Available: ${availableDrivers.length}`);

    // 6. Check Orders
    console.log('\n📊 ORDERS:');
    const orders = await Order.find({});
    console.log(`   Total: ${orders.length}`);

    const ordersByStatus = {};
    orders.forEach(order => {
      if (!ordersByStatus[order.status]) ordersByStatus[order.status] = 0;
      ordersByStatus[order.status]++;
    });

    if (orders.length > 0) {
      console.log('\n   Orders by Status:');
      Object.entries(ordersByStatus).forEach(([status, count]) => {
        console.log(`      - ${status}: ${count}`);
      });
    }

    // 7. Check for Issues
    console.log('\n\n🔍 ISSUES FOUND:');
    console.log('='.repeat(60));

    let issueCount = 0;

    if (itemsWithoutImages.length > 0) {
      issueCount++;
      console.log(`\n${issueCount}. ${itemsWithoutImages.length} menu items without images`);
    }

    if (unlinkedVendors.length > 0) {
      issueCount++;
      console.log(`\n${issueCount}. ${unlinkedVendors.length} vendors not linked to restaurants`);
    }

    const unapprovedRestaurants = restaurants.filter(r => !r.isApproved);
    if (unapprovedRestaurants.length > 0) {
      issueCount++;
      console.log(`\n${issueCount}. ${unapprovedRestaurants.length} restaurants not approved:`);
      unapprovedRestaurants.forEach(r => console.log(`   - ${r.name}`));
    }

    if (issueCount === 0) {
      console.log('\n✅ No issues found! Project is healthy!');
    }

    console.log('\n' + '='.repeat(60));
    console.log('\n✅ Health check complete!\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkProjectHealth();
