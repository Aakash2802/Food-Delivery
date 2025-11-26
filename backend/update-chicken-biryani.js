const mongoose = require('mongoose');
const MenuItem = require('./src/models/MenuItem');

async function updateKurinjiChickenBiryani() {
  try {
    await mongoose.connect('mongodb://localhost:27017/food-delivery');
    console.log('✅ Connected to database\n');

    // Update Kurinji Chicken Biryani only
    const result = await MenuItem.updateOne(
      {
        name: /^chicken biryani$/i,
        restaurantId: new mongoose.Types.ObjectId('69219c11ef7b82d2dc9996c8')
      },
      {
        $set: {
          price: 120
        }
      }
    );

    console.log(`✓ Updated Chicken Biryani (Kurinji only)`);
    console.log(`  - Changed price: ₹280 → ₹120`);
    console.log(`\n✅ Modified ${result.modifiedCount} document(s)`);

    // Verify the change
    const item = await MenuItem.findOne({
      name: /^chicken biryani$/i,
      restaurantId: new mongoose.Types.ObjectId('69219c11ef7b82d2dc9996c8')
    });

    if (item) {
      console.log('\nVerification:');
      console.log(`  Name: ${item.name}`);
      console.log(`  Price: ₹${item.price}`);
      console.log(`  Restaurant: Kurinji Biryani House`);
    }

    // Check other restaurants with Chicken Biryani remain unchanged
    const otherBiryani = await MenuItem.find({
      name: /chicken.*biryani/i,
      restaurantId: { $ne: new mongoose.Types.ObjectId('69219c11ef7b82d2dc9996c8') }
    });

    console.log(`\n📋 Other restaurants with Chicken Biryani: ${otherBiryani.length} (unchanged)`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

updateKurinjiChickenBiryani();
