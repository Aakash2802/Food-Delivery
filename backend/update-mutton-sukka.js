const mongoose = require('mongoose');
const MenuItem = require('./src/models/MenuItem');

async function updateToSmokedChickenLollipop() {
  try {
    await mongoose.connect('mongodb://localhost:27017/food-delivery');
    console.log('✅ Connected to database\n');

    // Change Pomfret Fry to Smoked Chicken Lollipop (New Mass only)
    const result = await MenuItem.updateOne(
      {
        name: /^pomfret fry$/i,
        restaurantId: new mongoose.Types.ObjectId('691432226033d14a068e0ecb')
      },
      {
        $set: {
          name: 'Smoked Chicken Lollipop (4 Pcs)',
          price: 120,
          description: 'Tender chicken wings marinated with smoky spices, coated and deep-fried to perfection - 4 pieces of crispy, juicy lollipops',
          images: ['https://56d3203e.delivery.rocketcdn.me/wp-content/uploads/2025/01/Smoked-Chicken-Lollipops-scaled.jpg'],
          isVeg: false,
          spiceLevel: 'medium'
        }
      }
    );

    console.log(`✓ Updated: Pomfret Fry → Smoked Chicken Lollipop (4 Pcs) (New Mass only)`);
    console.log(`  - Changed name to Smoked Chicken Lollipop (4 Pcs)`);
    console.log(`  - Changed price: ₹380 → ₹120`);
    console.log(`  - Updated description`);
    console.log(`  - Updated image`);
    console.log(`\n✅ Modified ${result.modifiedCount} document(s)`);

    // Verify the change
    const item = await MenuItem.findOne({
      name: /smoked chicken lollipop/i,
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

    // Check other restaurants with Pomfret Fry remain unchanged
    const otherPomfret = await MenuItem.find({
      name: /pomfret fry/i,
      restaurantId: { $ne: new mongoose.Types.ObjectId('691432226033d14a068e0ecb') }
    });

    console.log(`\n📋 Other restaurants with Pomfret Fry: ${otherPomfret.length} (unchanged)`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

updateToSmokedChickenLollipop();
