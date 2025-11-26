const mongoose = require('mongoose');
const MenuItem = require('./src/models/MenuItem');

async function updateChickenBiryani() {
  try {
    await mongoose.connect('mongodb://localhost:27017/food-delivery');
    console.log('✅ Connected to database\n');

    // Update Chicken Biryani (there might be multiple, so let's update all)
    const result = await MenuItem.updateMany(
      { name: /chicken.*biryani/i },
      {
        $set: {
          price: 120,
          images: ['https://media-assets.swiggy.com/swiggy/image/upload/f_auto,q_auto,fl_lossy/30c1fa2a581fc9d6dfc64f6f6c908ec8']
        }
      }
    );

    console.log(`✓ Updated Chicken Biryani`);
    console.log(`  - Changed price: → ₹120`);
    console.log(`  - Updated image`);
    console.log(`\n✅ Modified ${result.modifiedCount} document(s)`);

    // Verify the changes
    const items = await MenuItem.find({ name: /chicken.*biryani/i });
    console.log(`\nVerification - Found ${items.length} Chicken Biryani item(s):\n`);

    items.forEach((item, index) => {
      console.log(`${index + 1}. Name: ${item.name}`);
      console.log(`   Price: ₹${item.price}`);
      console.log(`   Restaurant: ${item.restaurantId}`);
      console.log(`   Image: ${item.images[0].substring(0, 70)}...\n`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

updateChickenBiryani();
