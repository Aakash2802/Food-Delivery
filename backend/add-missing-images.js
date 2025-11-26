const mongoose = require('mongoose');
const MenuItem = require('./src/models/MenuItem');

async function addMissingImages() {
  try {
    await mongoose.connect('mongodb://localhost:27017/food-delivery');
    console.log('✅ Connected to database\n');

    const missingImagesMap = {
      'Mutton Liver Fry': 'https://www.yummytummyaarthi.com/wp-content/uploads/2014/04/1-43.jpg',
      'Chicken Varuval': 'https://www.kannammacooks.com/wp-content/uploads/chicken-varuval-recipe-1-3.jpg',
      'Parotta with Salna': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRvQ8YT8nQ-6LLvb8zS2XZJDqF4YDgUqZo1sw&s',
      'Paruthi Paal': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTxWCU3m3JwqHmLf0xVDLHXLK8P9S0vB6iKdA&s',
      'Bun Parotta': 'https://madrasbawarchi.com/wp-content/uploads/2022/04/madurai-bun-parotta.jpg'
    };

    let updatedCount = 0;

    for (const [itemName, imageUrl] of Object.entries(missingImagesMap)) {
      const result = await MenuItem.updateOne(
        { name: itemName },
        { $set: { images: [imageUrl] } }
      );

      if (result.modifiedCount > 0) {
        updatedCount++;
        console.log(`✓ Added image to: ${itemName}`);
      } else {
        console.log(`⚠️  Item not found or already has image: ${itemName}`);
      }
    }

    console.log(`\n✅ Updated ${updatedCount} menu items with images`);

    // Verify
    const itemsWithoutImages = await MenuItem.find({
      $or: [
        { images: { $exists: false } },
        { images: { $size: 0 } }
      ]
    });

    console.log(`\n📊 Verification:`);
    console.log(`   Items without images: ${itemsWithoutImages.length}`);

    if (itemsWithoutImages.length > 0) {
      console.log('\n   Still missing images:');
      itemsWithoutImages.forEach(item => console.log(`      - ${item.name}`));
    } else {
      console.log('   ✅ All items now have images!');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

addMissingImages();
