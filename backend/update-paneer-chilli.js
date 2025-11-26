const mongoose = require('mongoose');
const MenuItem = require('./src/models/MenuItem');

async function updatePaneerChilli() {
  try {
    await mongoose.connect('mongodb://localhost:27017/food-delivery');
    console.log('✅ Connected to database\n');

    // Update Paneer Chilli
    const result = await MenuItem.updateOne(
      { name: /paneer chilli/i },
      {
        $set: {
          price: 160,
          images: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSLL7ELazVbZPsu6A-qDZrMCtq9h6ZR8iMGMA&s']
        }
      }
    );

    console.log(`✓ Updated Paneer Chilli`);
    console.log(`  - Changed price: → ₹160`);
    console.log(`  - Updated image`);
    console.log(`\n✅ Modified ${result.modifiedCount} document(s)`);

    // Verify the change
    const item = await MenuItem.findOne({ name: /paneer chilli/i });
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

updatePaneerChilli();
