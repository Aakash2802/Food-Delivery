const mongoose = require('mongoose');
const MenuItem = require('./src/models/MenuItem');

const updatedDescriptions = {
  'Mutton Sukka': 'Spicy dry mutton preparation with aromatic Chettinad spices, a flavorful South Indian delicacy',
  'Chicken Kothu Parotta': 'Shredded parotta mixed with spicy chicken, eggs, and aromatic spices - a popular street food from Tamil Nadu',
  'Fish Fry': 'Crispy fried fish marinated with South Indian spices and herbs, perfectly golden and flavorful',
  'Kola Urundai (2 Pcs)': 'Traditional Madurai meatballs made with minced mutton, spices and herbs - a Chettinad specialty (2 pieces)',
  'Chicken Biryani': 'Aromatic basmati rice cooked with tender chicken pieces, fragrant spices and herbs',
  'Egg Biryani': 'Flavorful biryani rice layered with perfectly boiled eggs and aromatic spices',
  'Mutton Biryani': 'Premium Chettinad-style mutton biryani with tender meat and fragrant basmati rice',
  'Prawn Gravy': 'Succulent prawns cooked in a rich, spicy Chettinad-style gravy with aromatic spices',
  'Gulab Jamun (4 Pcs)': 'Soft, spongy milk balls soaked in sweet rose-flavored sugar syrup - a classic Indian dessert (4 pieces)',
  'Chettinad Chicken': 'Spicy chicken curry prepared with traditional Chettinad masala and aromatic spices',
  'Chettinad Egg Curry': 'Hard-boiled eggs cooked in rich Chettinad-style gravy with coconut and spices',
  'Parotta (2 Pcs)': 'Flaky, layered South Indian flatbread - perfect accompaniment to any curry (2 pieces)'
};

async function updateDescriptions() {
  try {
    await mongoose.connect('mongodb://localhost:27017/food-delivery');
    console.log('✅ Connected to database\n');

    let updatedCount = 0;

    for (const [itemName, description] of Object.entries(updatedDescriptions)) {
      const result = await MenuItem.updateOne(
        { name: itemName },
        { $set: { description: description } }
      );

      if (result.modifiedCount > 0) {
        updatedCount++;
        console.log(`✓ Updated description for: ${itemName}`);
      } else {
        console.log(`⚠ Item not found or already up to date: ${itemName}`);
      }
    }

    console.log(`\n✅ Successfully updated ${updatedCount}/${Object.keys(updatedDescriptions).length} descriptions`);

    // Verify a few items
    console.log('\n📋 Sample verifications:');
    const sampleItems = ['Mutton Sukka', 'Prawn Gravy', 'Gulab Jamun (4 Pcs)'];
    for (const itemName of sampleItems) {
      const item = await MenuItem.findOne({ name: itemName });
      if (item) {
        console.log(`\n${item.name}:`);
        console.log(`  ${item.description}`);
      }
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

updateDescriptions();
