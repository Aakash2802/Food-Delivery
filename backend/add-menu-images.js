const mongoose = require('mongoose');
const MenuItem = require('./src/models/MenuItem');

// Mapping of dish names/keywords to appropriate food images
const dishImageMap = {
  // Indian dishes
  'biryani': 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500',
  'paneer': 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500',
  'butter chicken': 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=500',
  'chicken tikka': 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=500',
  'tandoori': 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=500',
  'naan': 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500',
  'dal': 'https://images.unsplash.com/photo-1546833998-877b37c2e5c6?w=500',
  'samosa': 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500',
  'pakora': 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=500',
  'masala dosa': 'https://images.unsplash.com/photo-1630383249896-424e482df921?w=500',
  'dosa': 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=500',
  'idli': 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500',
  'vada': 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=500',
  'chole': 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=500',
  'roti': 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500',
  'curry': 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=500',
  'korma': 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=500',
  'raita': 'https://images.unsplash.com/photo-1505253758473-96b7015fcd40?w=500',
  'gulab jamun': 'https://images.unsplash.com/photo-1571167530149-c9b5ae0c7ab3?w=500',
  'rasmalai': 'https://images.unsplash.com/photo-1589301773859-342e94691ca3?w=500',

  // Chinese dishes
  'fried rice': 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=500',
  'noodles': 'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=500',
  'chow mein': 'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=500',
  'manchurian': 'https://images.unsplash.com/photo-1626804475297-41608ea09aeb?w=500',
  'spring roll': 'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=500',
  'dumpling': 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=500',
  'soup': 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=500',
  'chilli chicken': 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=500',
  'chicken 65': 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=500',

  // Pizza & Italian
  'pizza': 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500',
  'pasta': 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=500',
  'spaghetti': 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=500',
  'lasagna': 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=500',

  // Burgers & Fast Food
  'burger': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500',
  'sandwich': 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=500',
  'fries': 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500',
  'wrap': 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=500',

  // South Indian
  'uttapam': 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=500',
  'pongal': 'https://images.unsplash.com/photo-1626074353765-517a4f1a4cab?w=500',
  'upma': 'https://images.unsplash.com/photo-1626074353765-517a4f1a4cab?w=500',
  'medu vada': 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=500',

  // Chicken dishes
  'chicken': 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=500',
  'grilled chicken': 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=500',
  'fried chicken': 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=500',

  // Mutton dishes
  'mutton': 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=500',
  'lamb': 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=500',
  'keema': 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=500',

  // Fish dishes
  'fish': 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=500',
  'prawn': 'https://images.unsplash.com/photo-1559737558-2f5a32d7f332?w=500',
  'seafood': 'https://images.unsplash.com/photo-1534766438357-2b18cd1b7f7e?w=500',
  'meen': 'https://images.unsplash.com/photo-1534766438357-2b18cd1b7f7e?w=500',

  // Beverages
  'coffee': 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=500',
  'tea': 'https://images.unsplash.com/photo-1597318130652-4b45a92ddbb3?w=500',
  'juice': 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=500',
  'lassi': 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=500',
  'milkshake': 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=500',
  'smoothie': 'https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=500',
  'jigarthanda': 'https://images.unsplash.com/photo-1546173159-315724a31696?w=500',

  // Desserts
  'ice cream': 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=500',
  'cake': 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500',
  'brownie': 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500',
  'kulfi': 'https://images.unsplash.com/photo-1582716401301-b2407dc7563d?w=500',

  // Rice dishes
  'fried rice': 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=500',
  'pulao': 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=500',

  // Parotta & Breads
  'parotta': 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500',
  'chapati': 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500',

  // Default fallback
  'default': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500'
};

function getImageForDish(dishName) {
  const name = dishName.toLowerCase();

  // Try to find a matching keyword in the dish name
  for (const [keyword, imageUrl] of Object.entries(dishImageMap)) {
    if (name.includes(keyword)) {
      return imageUrl;
    }
  }

  // Return default food image if no match found
  return dishImageMap.default;
}

async function addImagesToMenuItems() {
  try {
    await mongoose.connect('mongodb://localhost:27017/food-delivery');
    console.log('✅ Connected to database');

    // Get all menu items that don't have images or have empty images array
    const menuItems = await MenuItem.find({
      $or: [
        { images: { $exists: false } },
        { images: { $size: 0 } },
        { images: null }
      ]
    });

    console.log(`\n📋 Found ${menuItems.length} menu items without images`);

    let updatedCount = 0;
    const categoryStats = {};

    for (const item of menuItems) {
      const imageUrl = getImageForDish(item.name);

      // Update the menu item with the image
      item.images = [imageUrl];
      await item.save();

      updatedCount++;

      // Track stats by category
      if (!categoryStats[item.category]) {
        categoryStats[item.category] = 0;
      }
      categoryStats[item.category]++;

      console.log(`✓ Added image to: ${item.name} (${item.category})`);
    }

    console.log(`\n✅ Successfully added images to ${updatedCount} menu items`);

    console.log('\n📊 Updated items by category:');
    Object.entries(categoryStats).forEach(([category, count]) => {
      console.log(`   - ${category}: ${count} items`);
    });

    // Get total count of all menu items now
    const totalItems = await MenuItem.countDocuments();
    const itemsWithImages = await MenuItem.countDocuments({
      images: { $exists: true, $ne: [], $ne: null }
    });

    console.log(`\n📈 Final Statistics:`);
    console.log(`   - Total menu items: ${totalItems}`);
    console.log(`   - Items with images: ${itemsWithImages}`);
    console.log(`   - Coverage: ${((itemsWithImages/totalItems)*100).toFixed(1)}%`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

addImagesToMenuItems();
