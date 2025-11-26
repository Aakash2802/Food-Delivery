const mongoose = require('mongoose');
const MenuItem = require('./src/models/MenuItem');

async function updateToEggKothuParotta() {
  try {
    await mongoose.connect('mongodb://localhost:27017/food-delivery');
    console.log('✅ Connected to database\n');

    // Change Parotta with Salna to Egg Kothu Parotta
    const result = await MenuItem.updateOne(
      { name: /parotta.*salna/i },
      {
        $set: {
          name: 'Egg Kothu Parotta',
          price: 90,
          description: 'Flaky shredded parotta stir-fried with eggs, onions, tomatoes, and aromatic Madurai spices - a street food classic',
          images: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTriovHeHAkNXcqamoXzHXpDYDrsmWSbU9NTw&s'],
          isVeg: false
        }
      }
    );

    console.log(`✓ Updated: Parotta with Salna → Egg Kothu Parotta`);
    console.log(`  - Changed name to Egg Kothu Parotta`);
    console.log(`  - Changed price: ₹120 → ₹90`);
    console.log(`  - Updated description`);
    console.log(`  - Updated image`);
    console.log(`  - Changed to Non-Veg`);
    console.log(`\n✅ Modified ${result.modifiedCount} document(s)`);

    // Verify the change
    const item = await MenuItem.findOne({ name: /egg kothu parotta/i });
    if (item) {
      console.log('\nVerification:');
      console.log(`  Name: ${item.name}`);
      console.log(`  Price: ₹${item.price}`);
      console.log(`  Description: ${item.description}`);
      console.log(`  Veg: ${item.isVeg ? 'Yes' : 'No (Non-Veg)'}`);
      console.log(`  Image: ${item.images[0].substring(0, 60)}...`);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

updateToEggKothuParotta();
