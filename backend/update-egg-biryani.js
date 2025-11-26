const mongoose = require('mongoose');
const MenuItem = require('./src/models/MenuItem');

async function updateEggBiryani() {
  try {
    await mongoose.connect('mongodb://localhost:27017/food-delivery');
    console.log('✅ Connected to database\n');

    // Update Egg Biryani
    const result = await MenuItem.updateOne(
      { name: /egg biryani/i },
      {
        $set: {
          price: 90,
          images: ['https://www.pavaniskitchen.com/wp-content/uploads/2021/04/egg-biryani-recipe.jpg']
        }
      }
    );

    console.log(`✓ Updated Egg Biryani`);
    console.log(`  - Changed price: → ₹90`);
    console.log(`  - Updated image`);
    console.log(`\n✅ Modified ${result.modifiedCount} document(s)`);

    // Verify the change
    const item = await MenuItem.findOne({ name: /egg biryani/i });
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

updateEggBiryani();
