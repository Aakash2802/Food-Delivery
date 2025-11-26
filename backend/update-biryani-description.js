const mongoose = require('mongoose');
const MenuItem = require('./src/models/MenuItem');

async function updateBiryaniDescription() {
  try {
    await mongoose.connect('mongodb://localhost:27017/food-delivery');
    console.log('✅ Connected to database\n');

    // Update Chicken Biryani descriptions
    const chickenBiryaniUpdates = [
      {
        filter: { name: 'Chicken Biryani', restaurantId: new mongoose.Types.ObjectId('69219c11ef7b82d2dc9996c8') },
        description: 'Aromatic chicken biryani made with authentic seeraga samba rice, tender chicken pieces, and traditional Madurai spices'
      },
      {
        filter: { name: 'Madurai Chicken Biryani', restaurantId: new mongoose.Types.ObjectId('691432226033d14a068e0ecb') },
        description: 'Fragrant chicken biryani with seeraga samba rice and Madurai special masala, cooked to perfection with tender chicken pieces'
      }
    ];

    let updatedCount = 0;

    for (const update of chickenBiryaniUpdates) {
      const result = await MenuItem.updateOne(
        update.filter,
        {
          $set: {
            description: update.description
          }
        }
      );

      if (result.modifiedCount > 0) {
        updatedCount++;
        console.log(`✓ Updated: ${update.filter.name}`);
        console.log(`   Description: ${update.description}\n`);
      }
    }

    console.log(`✅ Updated ${updatedCount} Chicken Biryani description(s)`);

    // Verify the changes
    const items = await MenuItem.find({ name: /chicken.*biryani/i });
    console.log(`\n📋 All Chicken Biryani items:\n`);

    for (const item of items) {
      console.log(`• ${item.name}`);
      console.log(`  Price: ₹${item.price}`);
      console.log(`  Description: ${item.description}\n`);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

updateBiryaniDescription();
