const mongoose = require('mongoose');
const MenuItem = require('./src/models/MenuItem');

async function updateMeenKuzhambu() {
  try {
    await mongoose.connect('mongodb://localhost:27017/food-delivery');
    console.log('✅ Connected to database\n');

    // Update Meen Kuzhambu (New Mass only)
    const result = await MenuItem.updateOne(
      {
        name: /^meen kuzhambu$/i,
        restaurantId: new mongoose.Types.ObjectId('691432226033d14a068e0ecb')
      },
      {
        $set: {
          price: 150,
          description: 'Traditional Madurai-style fish curry cooked with tamarind, tomatoes, and aromatic spices - a tangy and spicy delight',
          images: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRap9e3hQOMrhIHpseVU6IyxVHsV2v1RRdDAw&s']
        }
      }
    );

    console.log(`✓ Updated Meen Kuzhambu (New Mass only)`);
    console.log(`  - Changed price: ₹280 → ₹150`);
    console.log(`  - Updated description`);
    console.log(`  - Updated image`);
    console.log(`\n✅ Modified ${result.modifiedCount} document(s)`);

    // Verify the change
    const item = await MenuItem.findOne({
      name: /^meen kuzhambu$/i,
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

    // Check other restaurants with Meen Kuzhambu remain unchanged
    const otherMeenKuzhambu = await MenuItem.find({
      name: /meen kuzhambu/i,
      restaurantId: { $ne: new mongoose.Types.ObjectId('691432226033d14a068e0ecb') }
    });

    console.log(`\n📋 Other restaurants with Meen Kuzhambu: ${otherMeenKuzhambu.length} (unchanged)`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

updateMeenKuzhambu();
