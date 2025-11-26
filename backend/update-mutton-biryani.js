const mongoose = require('mongoose');
const MenuItem = require('./src/models/MenuItem');

async function updateMuttonBiryani() {
  try {
    await mongoose.connect('mongodb://localhost:27017/food-delivery');
    console.log('✅ Connected to database\n');

    // Update Mutton Biryani
    const result = await MenuItem.updateOne(
      { name: /mutton biryani/i },
      {
        $set: {
          price: 160,
          images: ['https://www.awesomecuisine.com/wp-content/uploads/2012/11/Chettinad-Mutton-Biryani.jpg']
        }
      }
    );

    console.log(`✓ Updated Mutton Biryani`);
    console.log(`  - Changed price: → ₹160`);
    console.log(`  - Updated image`);
    console.log(`\n✅ Modified ${result.modifiedCount} document(s)`);

    // Verify the change
    const item = await MenuItem.findOne({ name: /mutton biryani/i });
    console.log('\nVerification:');
    console.log(`  Name: ${item.name}`);
    console.log(`  Price: ₹${item.price}`);
    console.log(`  Image: ${item.images[0].substring(0, 60)}...`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

updateMuttonBiryani();
