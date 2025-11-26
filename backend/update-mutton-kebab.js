const mongoose = require('mongoose');
const MenuItem = require('./src/models/MenuItem');

async function updateMuttonLiverFry() {
  try {
    await mongoose.connect('mongodb://localhost:27017/food-delivery');
    console.log('✅ Connected to database\n');

    // Update Mutton Liver Fry (New Mass only)
    const result = await MenuItem.updateOne(
      {
        name: /mutton liver fry/i,
        restaurantId: new mongoose.Types.ObjectId('691432226033d14a068e0ecb')
      },
      {
        $set: {
          price: 130,
          description: 'Tender mutton liver pieces marinated with Madurai spices and shallow-fried to perfection - crispy, flavorful, and aromatic',
          images: ['https://www.telugufoodrecipes.com/resources/picture/org/mutton-liver-fry.jpg']
        }
      }
    );

    console.log(`✓ Updated Mutton Liver Fry (New Mass only)`);
    console.log(`  - Changed price: ₹240 → ₹130`);
    console.log(`  - Updated description`);
    console.log(`  - Updated image`);
    console.log(`\n✅ Modified ${result.modifiedCount} document(s)`);

    // Verify the change
    const item = await MenuItem.findOne({
      name: /mutton liver fry/i,
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

    // Check other restaurants with Liver Fry remain unchanged
    const otherLiverFry = await MenuItem.find({
      name: /liver fry/i,
      restaurantId: { $ne: new mongoose.Types.ObjectId('691432226033d14a068e0ecb') }
    });

    console.log(`\n📋 Other restaurants with Liver Fry: ${otherLiverFry.length} (unchanged)`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

updateMuttonLiverFry();
