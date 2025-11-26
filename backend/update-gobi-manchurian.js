const mongoose = require('mongoose');
const MenuItem = require('./src/models/MenuItem');

async function updateGobiManchurian() {
  try {
    await mongoose.connect('mongodb://localhost:27017/food-delivery');
    console.log('✅ Connected to database\n');

    // Update Gobi Manchurian
    const result = await MenuItem.updateOne(
      { name: /gobi manchurian/i },
      {
        $set: {
          price: 100,
          images: ['https://www.indianhealthyrecipes.com/wp-content/uploads/2022/02/gobi-manchurian-cauliflower-manchurian.jpg']
        }
      }
    );

    console.log(`✓ Updated Gobi Manchurian`);
    console.log(`  - Changed price: → ₹100`);
    console.log(`  - Updated image`);
    console.log(`\n✅ Modified ${result.modifiedCount} document(s)`);

    // Verify the change
    const item = await MenuItem.findOne({ name: /gobi manchurian/i });
    console.log('\nVerification:');
    console.log(`  Name: ${item.name}`);
    console.log(`  Price: ₹${item.price}`);
    console.log(`  Image: ${item.images[0].substring(0, 60)}...`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

updateGobiManchurian();
