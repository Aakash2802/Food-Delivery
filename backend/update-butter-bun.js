const mongoose = require('mongoose');
const MenuItem = require('./src/models/MenuItem');

async function updateButterBun() {
  try {
    await mongoose.connect('mongodb://localhost:27017/food-delivery');
    console.log('✅ Connected to database\n');

    // Update Veg Spring Rolls to Butter Bun
    const result = await MenuItem.updateOne(
      { name: /veg spring rolls/i },
      {
        $set: {
          name: 'Butter Bun',
          price: 30,
          description: 'Soft, fluffy bun generously spread with creamy butter - a classic tea-time snack',
          images: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSl9RbCYiggLLeXTzNANlkqzkg6m6yJ2ZqopQ&s'],
          isVeg: true
        }
      }
    );

    console.log(`✓ Updated Veg Spring Rolls to Butter Bun`);
    console.log(`  - Changed name: Veg Spring Rolls (6 Pcs) → Butter Bun`);
    console.log(`  - Changed price: ₹100 → ₹30`);
    console.log(`  - Updated description`);
    console.log(`  - Updated image`);
    console.log(`\n✅ Modified ${result.modifiedCount} document(s)`);

    // Verify the change
    const item = await MenuItem.findOne({ name: /butter bun/i });
    if (item) {
      console.log('\nVerification:');
      console.log(`  Name: ${item.name}`);
      console.log(`  Price: ₹${item.price}`);
      console.log(`  Description: ${item.description}`);
      console.log(`  Veg: ${item.isVeg ? 'Yes 🌱' : 'No'}`);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

updateButterBun();
