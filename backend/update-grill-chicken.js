const mongoose = require('mongoose');
const MenuItem = require('./src/models/MenuItem');

async function updateToGrillChicken() {
  try {
    await mongoose.connect('mongodb://localhost:27017/food-delivery');
    console.log('✅ Connected to database\n');

    // Change Chicken 65 to Grill Chicken Full (New Mass only)
    const result = await MenuItem.updateOne(
      {
        name: /^chicken 65$/i,
        restaurantId: new mongoose.Types.ObjectId('691432226033d14a068e0ecb')
      },
      {
        $set: {
          name: 'Grill Chicken Full',
          price: 300,
          description: 'Whole chicken marinated with special Madurai spices and grilled to perfection - juicy, smoky, and packed with flavor',
          images: ['https://www.seriouseats.com/thmb/Xg3PF38VgjCJ84927mLRBorlMoU=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/SEA-the-best-barbecue-chicken-recipe-hero-updated-9cb214fe8fe8438992e049f8be51a708.jpg'],
          isVeg: false,
          spiceLevel: 'medium'
        }
      }
    );

    console.log(`✓ Updated: Chicken 65 → Grill Chicken Full (New Mass only)`);
    console.log(`  - Changed name to Grill Chicken Full`);
    console.log(`  - Changed price: ₹220 → ₹300`);
    console.log(`  - Updated description`);
    console.log(`  - Updated image`);
    console.log(`\n✅ Modified ${result.modifiedCount} document(s)`);

    // Verify the change
    const item = await MenuItem.findOne({
      name: /grill chicken full/i,
      restaurantId: new mongoose.Types.ObjectId('691432226033d14a068e0ecb')
    });

    if (item) {
      console.log('\nVerification:');
      console.log(`  Name: ${item.name}`);
      console.log(`  Price: ₹${item.price}`);
      console.log(`  Description: ${item.description}`);
      console.log(`  Restaurant: New Mass`);
      console.log(`  Image: ${item.images[0].substring(0, 60)}...`);
    }

    // Check other restaurants still have Chicken 65
    const otherChicken65 = await MenuItem.find({
      name: /chicken 65/i,
      restaurantId: { $ne: new mongoose.Types.ObjectId('691432226033d14a068e0ecb') }
    });

    console.log(`\n📋 Other restaurants with Chicken 65: ${otherChicken65.length} (unchanged)`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

updateToGrillChicken();
