const mongoose = require('mongoose');
const MenuItem = require('./src/models/MenuItem');

async function updateHakkaNoodles() {
  try {
    await mongoose.connect('mongodb://localhost:27017/food-delivery');
    console.log('✅ Connected to database\n');

    // Update Hakka Noodles
    const result = await MenuItem.updateOne(
      { name: /hakka noodles/i },
      {
        $set: {
          price: 100,
          images: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT89FGhd8AgfBheeK4V_IDWnVmRtq2Df_xa8w&s']
        }
      }
    );

    console.log(`✓ Updated Hakka Noodles`);
    console.log(`  - Changed price: → ₹100`);
    console.log(`  - Updated image`);
    console.log(`\n✅ Modified ${result.modifiedCount} document(s)`);

    // Verify the change
    const item = await MenuItem.findOne({ name: /hakka noodles/i });
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

updateHakkaNoodles();
