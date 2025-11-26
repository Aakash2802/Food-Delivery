const mongoose = require('mongoose');
const MenuItem = require('./src/models/MenuItem');

async function updateNewMassMuttonBiryani() {
  try {
    await mongoose.connect('mongodb://localhost:27017/food-delivery');
    console.log('✅ Connected to database\n');

    // Update New Mass - Mutton Biryani
    const result = await MenuItem.updateOne(
      {
        name: /madurai.*mutton.*biryani/i,
        restaurantId: new mongoose.Types.ObjectId('691432226033d14a068e0ecb')
      },
      {
        $set: {
          price: 160,
          description: 'Aromatic biryani with tender mutton pieces, seeraga samba rice, and traditional Madurai spices',
          images: ['https://i.ytimg.com/vi/9LIfzTxpbIc/maxresdefault.jpg']
        }
      }
    );

    console.log(`✓ Updated New Mass - Mutton Biryani`);
    console.log(`  - Changed price: ₹350 → ₹160`);
    console.log(`  - Updated description with seeraga samba rice`);
    console.log(`  - Updated image`);
    console.log(`\n✅ Modified ${result.modifiedCount} document(s)`);

    // Verify the change
    const item = await MenuItem.findOne({
      name: /madurai.*mutton.*biryani/i,
      restaurantId: new mongoose.Types.ObjectId('691432226033d14a068e0ecb')
    });

    if (item) {
      console.log('\nVerification:');
      console.log(`  Name: ${item.name}`);
      console.log(`  Price: ₹${item.price}`);
      console.log(`  Description: ${item.description}`);
      console.log(`  Image: ${item.images[0].substring(0, 50)}...`);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

updateNewMassMuttonBiryani();
