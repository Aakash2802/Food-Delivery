const mongoose = require('mongoose');
const MenuItem = require('./src/models/MenuItem');

async function fixPaniyaram() {
  try {
    await mongoose.connect('mongodb://localhost:27017/food-delivery');
    console.log('✅ Connected to database\n');

    // Update the specific Paneer Butter Masala by ObjectId
    const result = await MenuItem.updateOne(
      { _id: new mongoose.Types.ObjectId('69219c11ef7b82d2dc9996fe') },
      {
        $set: {
          name: 'Paniyaram (7 Pcs)',
          price: 50,
          description: 'Traditional South Indian sweet dumplings made from rice batter - a popular snack (7 pieces)',
          images: ['https://i0.wp.com/www.chitrasfoodbook.com/wp-content/uploads/2024/01/karupatti-paniyaram-recipe.jpg?resize=500%2C500&ssl=1'],
          isVeg: true
        }
      }
    );

    console.log(`✓ Updated Paneer Butter Masala to Paniyaram (7 Pcs)`);
    console.log(`  - Changed name: Paneer Butter Masala → Paniyaram (7 Pcs)`);
    console.log(`  - Changed price: ₹140 → ₹50`);
    console.log(`  - Updated description`);
    console.log(`  - Updated image`);
    console.log(`\n✅ Modified ${result.modifiedCount} document(s)`);

    // Verify the change
    const item = await MenuItem.findOne({ name: /paniyaram/i });
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

fixPaniyaram();
