const mongoose = require('mongoose');
const MenuItem = require('./src/models/MenuItem');

async function updateBunParotta() {
  try {
    await mongoose.connect('mongodb://localhost:27017/food-delivery');
    console.log('✅ Connected to database\n');

    // Update Bun Parotta
    const result = await MenuItem.updateOne(
      { name: /^bun parotta$/i },
      {
        $set: {
          name: 'Bun Parotta (2 Pcs)',
          price: 60,
          description: 'Soft layered bun parotta served with kurma - a Madurai street food favorite (2 pieces)',
          images: ['https://img-global.cpcdn.com/recipes/c05528ae66f0dfc0/1200x630cq80/photo.jpg']
        }
      }
    );

    console.log(`✓ Updated Bun Parotta`);
    console.log(`  - Changed name: Bun Parotta → Bun Parotta (2 Pcs)`);
    console.log(`  - Changed price: ₹80 → ₹60`);
    console.log(`  - Updated description`);
    console.log(`  - Updated image`);
    console.log(`\n✅ Modified ${result.modifiedCount} document(s)`);

    // Verify the change
    const item = await MenuItem.findOne({ name: /bun parotta/i });
    if (item) {
      console.log('\nVerification:');
      console.log(`  Name: ${item.name}`);
      console.log(`  Price: ₹${item.price}`);
      console.log(`  Description: ${item.description}`);
      console.log(`  Image: ${item.images[0].substring(0, 60)}...`);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

updateBunParotta();
