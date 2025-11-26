const mongoose = require('mongoose');
const MenuItem = require('./src/models/MenuItem');

async function restoreAnnapoornaFaneer() {
  try {
    await mongoose.connect('mongodb://localhost:27017/food-delivery');
    console.log('✅ Connected to database\n');

    // Restore Annapoorna's Paniyaram back to Paneer Butter Masala
    const result = await MenuItem.updateOne(
      { _id: new mongoose.Types.ObjectId('69219c11ef7b82d2dc9996f0') },
      {
        $set: {
          name: 'Paneer Butter Masala',
          price: 140,
          description: 'Soft paneer cubes cooked in rich, creamy tomato-based gravy with butter and aromatic spices',
          images: ['https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800&q=80'],
          isVeg: true
        }
      }
    );

    console.log(`✓ Restored Annapoorna Gowrishankar's Paneer Butter Masala`);
    console.log(`  - Changed name: Paniyaram (7 Pcs) → Paneer Butter Masala`);
    console.log(`  - Changed price: ₹50 → ₹140`);
    console.log(`  - Updated description`);
    console.log(`  - Updated image`);
    console.log(`\n✅ Modified ${result.modifiedCount} document(s)`);

    // Verify the change
    const item = await MenuItem.findOne({ _id: new mongoose.Types.ObjectId('69219c11ef7b82d2dc9996f0') });
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

restoreAnnapoornaFaneer();
