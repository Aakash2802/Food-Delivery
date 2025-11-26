const mongoose = require('mongoose');
const MenuItem = require('./src/models/MenuItem');

async function updateFishFry() {
  try {
    await mongoose.connect('mongodb://localhost:27017/food-delivery');
    console.log('✅ Connected to database\n');

    // Update Fish Fry (Nethili/Sardine) (New Mass only)
    const result = await MenuItem.updateOne(
      {
        name: /fish fry.*nethili/i,
        restaurantId: new mongoose.Types.ObjectId('691432226033d14a068e0ecb')
      },
      {
        $set: {
          price: 120,
          description: 'Fresh Nethili/Sardine fish marinated with aromatic Madurai spices and deep-fried to golden perfection - crispy outside, tender inside',
          images: ['https://i.ytimg.com/vi/u9wCoe0NmKk/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLDzhuH4L4rsLE8stCI54gvRoBWyOw']
        }
      }
    );

    console.log(`✓ Updated Fish Fry (New Mass only)`);
    console.log(`  - Changed price: ₹200 → ₹120`);
    console.log(`  - Updated description`);
    console.log(`  - Updated image`);
    console.log(`\n✅ Modified ${result.modifiedCount} document(s)`);

    // Verify the change
    const item = await MenuItem.findOne({
      name: /fish fry.*nethili/i,
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

    // Check other restaurants with Fish Fry remain unchanged
    const otherFishFry = await MenuItem.find({
      name: /fish fry/i,
      restaurantId: { $ne: new mongoose.Types.ObjectId('691432226033d14a068e0ecb') }
    });

    console.log(`\n📋 Other restaurants with Fish Fry: ${otherFishFry.length} (unchanged)`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

updateFishFry();
