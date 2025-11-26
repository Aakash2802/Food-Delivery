const mongoose = require('mongoose');
const MenuItem = require('./src/models/MenuItem');

async function updateJigarthanda() {
  try {
    await mongoose.connect('mongodb://localhost:27017/food-delivery');
    console.log('✅ Connected to database\n');

    // Update Jigarthanda
    const result = await MenuItem.updateOne(
      { name: /^jigarthanda$/i },
      {
        $set: {
          price: 50,
          images: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQwhndfMGeMVuqcltVXkPDBOrp56fPU3cPKiw&s']
        }
      }
    );

    console.log(`✓ Updated Jigarthanda`);
    console.log(`  - Changed price: → ₹50`);
    console.log(`  - Updated image`);
    console.log(`\n✅ Modified ${result.modifiedCount} document(s)`);

    // Verify the change
    const item = await MenuItem.findOne({ name: /^jigarthanda$/i });
    if (item) {
      console.log('\nVerification:');
      console.log(`  Name: ${item.name}`);
      console.log(`  Price: ₹${item.price}`);
      console.log(`  Image: ${item.images[0].substring(0, 60)}...`);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

updateJigarthanda();
