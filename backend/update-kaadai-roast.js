const mongoose = require('mongoose');
const MenuItem = require('./src/models/MenuItem');

async function updateToKaadaiRoast() {
  try {
    await mongoose.connect('mongodb://localhost:27017/food-delivery');
    console.log('✅ Connected to database\n');

    // Change Madurai Chicken Chettinad to Kaadai Roast (New Mass only)
    const result = await MenuItem.updateOne(
      {
        name: /madurai chicken chettinad/i,
        restaurantId: new mongoose.Types.ObjectId('691432226033d14a068e0ecb')
      },
      {
        $set: {
          name: 'Kaadai Roast',
          price: 110,
          description: 'Tender quail pieces marinated with Madurai spices and roasted to perfection - a traditional delicacy',
          images: ['https://selfiefamily.com/wp-content/uploads/2021/07/Kaadai-Roast.jpg'],
          isVeg: false,
          spiceLevel: 'hot'
        }
      }
    );

    console.log(`✓ Updated: Madurai Chicken Chettinad → Kaadai Roast (New Mass only)`);
    console.log(`  - Changed name to Kaadai Roast`);
    console.log(`  - Changed price: ₹180 → ₹110`);
    console.log(`  - Updated description`);
    console.log(`  - Updated image`);
    console.log(`\n✅ Modified ${result.modifiedCount} document(s)`);

    // Verify the change
    const item = await MenuItem.findOne({
      name: /kaadai roast/i,
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

    // Check other restaurants with Chettinad Chicken remain unchanged
    const otherChettinadChicken = await MenuItem.find({
      name: /chettinad/i,
      restaurantId: { $ne: new mongoose.Types.ObjectId('691432226033d14a068e0ecb') }
    });

    console.log(`\n📋 Other restaurants with Chettinad items: ${otherChettinadChicken.length} (unchanged)`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

updateToKaadaiRoast();
