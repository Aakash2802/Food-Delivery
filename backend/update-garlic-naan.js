const mongoose = require('mongoose');
const MenuItem = require('./src/models/MenuItem');

async function updateGarlicNaan() {
  try {
    await mongoose.connect('mongodb://localhost:27017/food-delivery');
    console.log('✅ Connected to database\n');

    // Update Garlic Naan to include quantity
    const result = await MenuItem.updateOne(
      { name: /^garlic naan$/i },
      {
        $set: {
          name: 'Garlic Naan (2 Pcs)',
          price: 50,
          description: 'Soft, fluffy naan bread brushed with garlic butter - perfect accompaniment to curries (2 pieces)',
          images: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSnByqBzBieOmLO3pwylDSVKvHavh7u0unFuJcmlfw9s912p1-V-zUZejwjmrqkYl4twok&usqp=CAU']
        }
      }
    );

    console.log(`✓ Updated Garlic Naan`);
    console.log(`  - Changed name: Garlic Naan → Garlic Naan (2 Pcs)`);
    console.log(`  - Changed price: → ₹50`);
    console.log(`  - Updated description`);
    console.log(`  - Updated image`);
    console.log(`\n✅ Modified ${result.modifiedCount} document(s)`);

    // Verify the change
    const item = await MenuItem.findOne({ name: /garlic naan.*2.*pcs/i });
    console.log('\nVerification:');
    console.log(`  Name: ${item.name}`);
    console.log(`  Price: ₹${item.price}`);
    console.log(`  Description: ${item.description}`);
    console.log(`  Image: ${item.images[0].substring(0, 60)}...`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

updateGarlicNaan();
