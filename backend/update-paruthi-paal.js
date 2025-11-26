const mongoose = require('mongoose');
const MenuItem = require('./src/models/MenuItem');

async function updateParuthiPaal() {
  try {
    await mongoose.connect('mongodb://localhost:27017/food-delivery');
    console.log('✅ Connected to database\n');

    // Update Paruthi Paal
    const result = await MenuItem.updateOne(
      { name: /^paruthi paal$/i },
      {
        $set: {
          price: 50,
          images: ['https://c.ndtvimg.com/2021-02/fs1bbgn8_paruthi-paal_625x300_22_February_21.jpg?im=FaceCrop,algorithm=dnn,width=1200,height=886']
        }
      }
    );

    console.log(`✓ Updated Paruthi Paal`);
    console.log(`  - Changed price: → ₹50`);
    console.log(`  - Updated image`);
    console.log(`\n✅ Modified ${result.modifiedCount} document(s)`);

    // Verify the change
    const item = await MenuItem.findOne({ name: /^paruthi paal$/i });
    if (item) {
      console.log('\nVerification:');
      console.log(`  Name: ${item.name}`);
      console.log(`  Price: ₹${item.price}`);
      console.log(`  Image: ${item.images[0].substring(0, 70)}...`);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

updateParuthiPaal();
