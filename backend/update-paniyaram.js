const mongoose = require('mongoose');
const MenuItem = require('./src/models/MenuItem');

async function updatePaniyaram() {
  try {
    await mongoose.connect('mongodb://localhost:27017/food-delivery');
    console.log('✅ Connected to database\n');

    // Check which Paneer Butter Masala to update (Temple City Cafe one)
    const items = await MenuItem.find({ name: /paneer butter masala/i });
    console.log(`Found ${items.length} Paneer Butter Masala items`);

    if (items.length > 0) {
      // For Temple City Cafe, convert to Paniyaram
      // Assuming the veg one (isVeg: true) is from Temple City Cafe
      const result = await MenuItem.updateOne(
        { name: /paneer butter masala/i, isVeg: true },
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

      if (result.modifiedCount === 0) {
        // If not found by isVeg, update the last one added
        const lastItem = items[items.length - 1];
        await MenuItem.updateOne(
          { _id: lastItem._id },
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
      }

      console.log(`✓ Updated Paneer Butter Masala to Paniyaram (7 Pcs)`);
      console.log(`  - Changed name: Paneer Butter Masala → Paniyaram (7 Pcs)`);
      console.log(`  - Changed price: → ₹50`);
      console.log(`  - Updated description`);
      console.log(`  - Updated image`);
      console.log(`\n✅ Successfully updated`);
    }

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

updatePaniyaram();
