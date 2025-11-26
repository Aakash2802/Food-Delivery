const mongoose = require('mongoose');
const MenuItem = require('./src/models/MenuItem');

async function updateMuttonChukka() {
  try {
    await mongoose.connect('mongodb://localhost:27017/food-delivery');
    console.log('✅ Connected to database\n');

    // Update Madurai Mutton Chukka (New Mass only)
    const result = await MenuItem.updateOne(
      {
        name: /madurai mutton chukka/i,
        restaurantId: new mongoose.Types.ObjectId('691432226033d14a068e0ecb')
      },
      {
        $set: {
          price: 160,
          description: 'Tender mutton pieces cooked with aromatic Madurai spices, onions, and curry leaves - dry, spicy, and packed with flavor',
          images: ['https://i1.wp.com/www.freshtohome.com/blog/wp-content/uploads/2024/06/Screenshot-2024-06-27-130844.png?fit=932%2C620&ssl=1']
        }
      }
    );

    console.log(`✓ Updated Madurai Mutton Chukka (New Mass only)`);
    console.log(`  - Changed price: ₹320 → ₹160`);
    console.log(`  - Updated description`);
    console.log(`  - Updated image`);
    console.log(`\n✅ Modified ${result.modifiedCount} document(s)`);

    // Verify the change
    const item = await MenuItem.findOne({
      name: /madurai mutton chukka/i,
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

    // Check other restaurants with Mutton Chukka remain unchanged
    const otherMuttonChukka = await MenuItem.find({
      name: /mutton chukka/i,
      restaurantId: { $ne: new mongoose.Types.ObjectId('691432226033d14a068e0ecb') }
    });

    console.log(`\n📋 Other restaurants with Mutton Chukka: ${otherMuttonChukka.length} (unchanged)`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

updateMuttonChukka();
