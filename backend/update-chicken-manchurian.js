const mongoose = require('mongoose');
const MenuItem = require('./src/models/MenuItem');

async function updateMuttonKolaUrundai() {
  try {
    await mongoose.connect('mongodb://localhost:27017/food-delivery');
    console.log('✅ Connected to database\n');

    // Update Mutton Kola Urundai (New Mass only)
    const result = await MenuItem.updateOne(
      {
        name: /mutton kola urundai/i,
        restaurantId: new mongoose.Types.ObjectId('691432226033d14a068e0ecb')
      },
      {
        $set: {
          name: 'Mutton Kola Urundai (4 Pcs)',
          price: 80,
          description: 'Traditional Madurai-style mutton meatballs seasoned with aromatic spices and deep-fried - 4 pieces of crispy, flavorful kola urundai',
          images: ['https://images.herzindagi.info/her-zindagi-tamil/images/2024/11/05/article/image/mutton-kola-urundai-1730814910495.webp']
        }
      }
    );

    console.log(`✓ Updated Mutton Kola Urundai (New Mass only)`);
    console.log(`  - Changed name to Mutton Kola Urundai (4 Pcs)`);
    console.log(`  - Changed price: ₹280 → ₹80`);
    console.log(`  - Updated description`);
    console.log(`  - Updated image`);
    console.log(`\n✅ Modified ${result.modifiedCount} document(s)`);

    // Verify the change
    const item = await MenuItem.findOne({
      name: /mutton kola urundai/i,
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

    // Check other restaurants with Kola Urundai remain unchanged
    const otherKolaUrundai = await MenuItem.find({
      name: /kola urundai/i,
      restaurantId: { $ne: new mongoose.Types.ObjectId('691432226033d14a068e0ecb') }
    });

    console.log(`\n📋 Other restaurants with Kola Urundai: ${otherKolaUrundai.length} (unchanged)`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

updateMuttonKolaUrundai();
