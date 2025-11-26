const mongoose = require('mongoose');
const MenuItem = require('./src/models/MenuItem');

async function updateToSemolinaPrawns() {
  try {
    await mongoose.connect('mongodb://localhost:27017/food-delivery');
    console.log('✅ Connected to database\n');

    // Change Prawn Masala to Semolina Coated Fried Prawns (New Mass only)
    const result = await MenuItem.updateOne(
      {
        name: /^prawn masala$/i,
        restaurantId: new mongoose.Types.ObjectId('691432226033d14a068e0ecb')
      },
      {
        $set: {
          name: 'Semolina Coated Fried Prawns',
          price: 180,
          description: 'Succulent prawns coated with semolina, seasoned with Madurai spices, and deep-fried to golden crispy perfection - a crunchy seafood delight',
          images: ['https://delishbite.in/wp-content/uploads/2023/05/Blog_1-1.jpg'],
          isVeg: false,
          spiceLevel: 'medium'
        }
      }
    );

    console.log(`✓ Updated: Prawn Masala → Semolina Coated Fried Prawns (New Mass only)`);
    console.log(`  - Changed name to Semolina Coated Fried Prawns`);
    console.log(`  - Changed price: ₹350 → ₹180`);
    console.log(`  - Updated description`);
    console.log(`  - Updated image`);
    console.log(`\n✅ Modified ${result.modifiedCount} document(s)`);

    // Verify the change
    const item = await MenuItem.findOne({
      name: /semolina.*prawns/i,
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

    // Check other restaurants with Prawn Masala remain unchanged
    const otherPrawnMasala = await MenuItem.find({
      name: /prawn masala/i,
      restaurantId: { $ne: new mongoose.Types.ObjectId('691432226033d14a068e0ecb') }
    });

    console.log(`\n📋 Other restaurants with Prawn Masala: ${otherPrawnMasala.length} (unchanged)`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

updateToSemolinaPrawns();
