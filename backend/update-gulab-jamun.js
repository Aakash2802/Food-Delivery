const mongoose = require('mongoose');
const MenuItem = require('./src/models/MenuItem');

async function updateKariDosa() {
  try {
    await mongoose.connect('mongodb://localhost:27017/food-delivery');
    console.log('✅ Connected to database\n');

    // Update Kari Dosa (New Mass only)
    const result = await MenuItem.updateOne(
      {
        name: /kari dosa/i,
        restaurantId: new mongoose.Types.ObjectId('691432226033d14a068e0ecb')
      },
      {
        $set: {
          price: 120,
          description: 'Crispy dosa stuffed with spicy mutton kari (curry) - a unique Madurai specialty combining South Indian dosa with flavorful meat curry',
          images: ['https://media-assets.swiggy.com/swiggy/image/upload/f_auto,q_auto,fl_lossy/b60206a5acde6ce653079d2fdfe537c4']
        }
      }
    );

    console.log(`✓ Updated Kari Dosa (New Mass only)`);
    console.log(`  - Changed price: ₹180 → ₹120`);
    console.log(`  - Updated description`);
    console.log(`  - Updated image`);
    console.log(`\n✅ Modified ${result.modifiedCount} document(s)`);

    // Verify the change
    const item = await MenuItem.findOne({
      name: /kari dosa/i,
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

    // Check other restaurants with Kari Dosa remain unchanged
    const otherKariDosa = await MenuItem.find({
      name: /kari dosa/i,
      restaurantId: { $ne: new mongoose.Types.ObjectId('691432226033d14a068e0ecb') }
    });

    console.log(`\n📋 Other restaurants with Kari Dosa: ${otherKariDosa.length} (unchanged)`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

updateKariDosa();
