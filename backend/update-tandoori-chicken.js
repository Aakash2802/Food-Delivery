const mongoose = require('mongoose');
const MenuItem = require('./src/models/MenuItem');

async function updateToTandooriChicken() {
  try {
    await mongoose.connect('mongodb://localhost:27017/food-delivery');
    console.log('✅ Connected to database\n');

    // Change Chicken Varuval to Tandoori Chicken Full (New Mass only)
    const result = await MenuItem.updateOne(
      {
        name: /^chicken varuval$/i,
        restaurantId: new mongoose.Types.ObjectId('691432226033d14a068e0ecb')
      },
      {
        $set: {
          name: 'Tandoori Chicken Full',
          price: 320,
          description: 'Whole chicken marinated in yogurt, aromatic spices, and traditional tandoori masala, cooked to perfection - a classic Madurai favorite',
          images: ['https://www.licious.in/blog/wp-content/uploads/2020/12/Tandoori-Chicken-600x600.jpg'],
          isVeg: false,
          spiceLevel: 'hot'
        }
      }
    );

    console.log(`✓ Updated: Chicken Varuval → Tandoori Chicken Full (New Mass only)`);
    console.log(`  - Changed name to Tandoori Chicken Full`);
    console.log(`  - Changed price: ₹240 → ₹320`);
    console.log(`  - Updated description`);
    console.log(`  - Updated image`);
    console.log(`\n✅ Modified ${result.modifiedCount} document(s)`);

    // Verify the change
    const item = await MenuItem.findOne({
      name: /tandoori chicken full/i,
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

    // Check other restaurants still have Chicken Varuval unchanged
    const otherChickenVaruval = await MenuItem.find({
      name: /chicken varuval/i,
      restaurantId: { $ne: new mongoose.Types.ObjectId('691432226033d14a068e0ecb') }
    });

    console.log(`\n📋 Other restaurants with Chicken Varuval: ${otherChickenVaruval.length} (unchanged)`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

updateToTandooriChicken();
