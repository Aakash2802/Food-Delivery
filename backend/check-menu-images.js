const mongoose = require('mongoose');
const MenuItem = require('./src/models/MenuItem');

mongoose.connect('mongodb://localhost:27017/food-delivery').then(async () => {
  console.log('✅ Connected to database');

  const items = await MenuItem.find().limit(10);

  console.log(`\n📋 Found ${items.length} menu items\n`);

  items.forEach((item, index) => {
    console.log(`${index + 1}. ${item.name}`);
    console.log(`   Restaurant ID: ${item.restaurantId}`);
    console.log(`   Images: ${JSON.stringify(item.images)}`);
    console.log(`   Has images: ${item.images && item.images.length > 0 ? 'YES' : 'NO'}`);
    console.log('');
  });

  // Count items with and without images
  const withImages = await MenuItem.countDocuments({
    images: { $exists: true, $ne: [], $ne: null }
  });
  const total = await MenuItem.countDocuments();

  console.log(`\n📊 Statistics:`);
  console.log(`   Total items: ${total}`);
  console.log(`   Items with images: ${withImages}`);
  console.log(`   Items without images: ${total - withImages}`);

  process.exit(0);
}).catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
