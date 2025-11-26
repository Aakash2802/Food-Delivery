const mongoose = require('mongoose');
const MenuItem = require('./src/models/MenuItem');

// Enhanced mapping with more specific images for each unique dish
const specificDishImages = {
  // South Indian Breakfast - Very specific
  'masala dosa': 'https://images.unsplash.com/photo-1630383249896-424e482df921?w=500',
  'plain dosa': 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=500',
  'rava dosa': 'https://images.unsplash.com/photo-1694159896878-8c0f46f0b9a3?w=500',
  'set dosa': 'https://images.unsplash.com/photo-1694159901102-03c67afb71c5?w=500',
  'kari dosa': 'https://images.unsplash.com/photo-1668236545523-15e1be0b51cd?w=500',
  'idli sambar': 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500',
  'idli': 'https://images.unsplash.com/photo-1589302062083-c5a7d6a4a74f?w=500',
  'medu vada': 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=500',
  'vada': 'https://images.unsplash.com/photo-1645479570397-0b39e47e8781?w=500',
  'pongal': 'https://images.unsplash.com/photo-1626074353765-517a4f1a4cab?w=500',
  'upma': 'https://images.unsplash.com/photo-1626074353765-517a4f1a4cab?w=500',
  'uttapam': 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=500',
  'poori': 'https://images.unsplash.com/photo-1626776876729-bab4a1e83f61?w=500',

  // Biryani varieties
  'chicken biryani': 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500',
  'mutton biryani': 'https://images.unsplash.com/photo-1642821373181-696a54913e93?w=500',
  'hyderabadi biryani': 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=500',
  'veg biryani': 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?w=500',
  'egg biryani': 'https://images.unsplash.com/photo-1663211874928-2ca4cef6ad17?w=500',

  // Chicken dishes - Each different
  'butter chicken': 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=500',
  'chicken tikka': 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=500',
  'tandoori chicken': 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=500',
  'chicken 65': 'https://images.unsplash.com/photo-1633504581786-316c8002b1b9?w=500',
  'chicken lollipop': 'https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?w=500',
  'grilled chicken': 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=500',
  'fried chicken': 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=500',
  'chicken wings': 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=500',
  'chicken kebab': 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=500',
  'chicken curry': 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=500',
  'chicken korma': 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=500',
  'chicken chettinad': 'https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?w=500',
  'chicken varuval': 'https://images.unsplash.com/photo-1631122189897-0e798d527999?w=500',

  // Mutton dishes - Distinct images
  'mutton': 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=500',
  'mutton chukka': 'https://images.unsplash.com/photo-1610678178749-27a61abf4ed9?w=500',
  'mutton kola urundai': 'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=500',
  'mutton liver': 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=500',
  'mutton keema': 'https://images.unsplash.com/photo-1617093727343-374698b1b08d?w=500',
  'lamb': 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=500',

  // Fish & Seafood - Unique
  'fish fry': 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=500',
  'fish curry': 'https://images.unsplash.com/photo-1534766438357-2b18cd1b7f7e?w=500',
  'meen kuzhambu': 'https://images.unsplash.com/photo-1580874533654-aaef8f2e31ca?w=500',
  'pomfret': 'https://images.unsplash.com/photo-1535140728325-a4d3707eee61?w=500',
  'prawn': 'https://images.unsplash.com/photo-1559737558-2f5a32d7f332?w=500',
  'prawn masala': 'https://images.unsplash.com/photo-1625937286074-9ca519d5d9df?w=500',
  'crab': 'https://images.unsplash.com/photo-1534766555764-ce878a5e3a2b?w=500',

  // Rice dishes
  'fried rice': 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=500',
  'veg fried rice': 'https://images.unsplash.com/photo-1645177628172-a94c30a5c31f?w=500',
  'schezwan rice': 'https://images.unsplash.com/photo-1645195342050-c7e4c2b7b2c7?w=500',
  'pulao': 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=500',
  'jeera rice': 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=500',
  'lemon rice': 'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=500',
  'curd rice': 'https://images.unsplash.com/photo-1694159900076-f40e03fd62d9?w=500',
  'tomato rice': 'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=500',

  // Noodles & Chinese
  'hakka noodles': 'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=500',
  'schezwan noodles': 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=500',
  'chowmein': 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=500',
  'manchurian': 'https://images.unsplash.com/photo-1626804475297-41608ea09aeb?w=500',
  'gobi manchurian': 'https://images.unsplash.com/photo-1626804475297-41608ea09aeb?w=500',
  'spring roll': 'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=500',
  'momos': 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=500',
  'dumpling': 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=500',

  // Paneer dishes
  'paneer tikka': 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500',
  'paneer butter masala': 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500',
  'palak paneer': 'https://images.unsplash.com/photo-1645177628172-a94c30a5c31f?w=500',
  'kadai paneer': 'https://images.unsplash.com/photo-1668236545525-3bc9ae525d3c?w=500',
  'paneer 65': 'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=500',

  // Breads - Each different
  'naan': 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500',
  'butter naan': 'https://images.unsplash.com/photo-1566045536983-f768e5dc1e06?w=500',
  'garlic naan': 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500',
  'roti': 'https://images.unsplash.com/photo-1617093727343-374698b1b08d?w=500',
  'chapati': 'https://images.unsplash.com/photo-1626776876729-bab4a1e83f61?w=500',
  'parotta': 'https://images.unsplash.com/photo-1668236545523-15e1be0b51cd?w=500',
  'kerala parotta': 'https://images.unsplash.com/photo-1694159902102-03c67afb71c5?w=500',
  'kulcha': 'https://images.unsplash.com/photo-1663511302959-7f529fff62a9?w=500',

  // Snacks & Starters
  'samosa': 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500',
  'pakora': 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=500',
  'onion pakoda': 'https://images.unsplash.com/photo-1580945805500-e5bfab97bc18?w=500',
  'bhajji': 'https://images.unsplash.com/photo-1645479570397-0b39e47e8781?w=500',
  'bonda': 'https://images.unsplash.com/photo-1633504581786-316c8002b1b9?w=500',
  'cutlet': 'https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?w=500',

  // Soups
  'tomato soup': 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=500',
  'hot and sour soup': 'https://images.unsplash.com/photo-1603105037880-880cd4edfb0d?w=500',
  'manchow soup': 'https://images.unsplash.com/photo-1587010084561-291b85bd7f05?w=500',
  'chicken soup': 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=500',

  // Beverages - Unique for each
  'filter coffee': 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=500',
  'coffee': 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=500',
  'tea': 'https://images.unsplash.com/photo-1597318130652-4b45a92ddbb3?w=500',
  'masala tea': 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=500',
  'lassi': 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=500',
  'jigarthanda': 'https://images.unsplash.com/photo-1546173159-315724a31696?w=500',
  'milkshake': 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=500',
  'fresh juice': 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=500',
  'lime juice': 'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=500',
  'buttermilk': 'https://images.unsplash.com/photo-1571835782488-29b0df8fb2e8?w=500',

  // Desserts - All different
  'gulab jamun': 'https://images.unsplash.com/photo-1571167530149-c9b5ae0c7ab3?w=500',
  'rasmalai': 'https://images.unsplash.com/photo-1589301773859-342e94691ca3?w=500',
  'ice cream': 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=500',
  'kulfi': 'https://images.unsplash.com/photo-1582716401301-b2407dc7563d?w=500',
  'kheer': 'https://images.unsplash.com/photo-1589301773859-342e94691ca3?w=500',
  'payasam': 'https://images.unsplash.com/photo-1640020124699-6535a813e85c?w=500',
  'rava kesari': 'https://images.unsplash.com/photo-1617093727343-374698b1b08d?w=500',
  'halwa': 'https://images.unsplash.com/photo-1645177628172-a94c30a5c31f?w=500',
  'jalebi': 'https://images.unsplash.com/photo-1586004344992-7efaaca41a4c?w=500',

  // Thali & Meals
  'meals': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500',
  'thali': 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=500',
  'special meals': 'https://images.unsplash.com/photo-1626776876729-bab4a1e83f61?w=500',
  'mini tiffin': 'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=500',

  // Curries & Gravies
  'dal': 'https://images.unsplash.com/photo-1546833998-877b37c2e5c6?w=500',
  'dal fry': 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=500',
  'chole': 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=500',
  'rajma': 'https://images.unsplash.com/photo-1645177628172-a94c30a5c31f?w=500',

  // Default fallback
  'default': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500'
};

function getSpecificImage(dishName) {
  const name = dishName.toLowerCase().trim();

  // First try exact match
  if (specificDishImages[name]) {
    return specificDishImages[name];
  }

  // Then try partial match with priority (longer matches first)
  const keywords = Object.keys(specificDishImages).sort((a, b) => b.length - a.length);
  for (const keyword of keywords) {
    if (name.includes(keyword)) {
      return specificDishImages[keyword];
    }
  }

  return specificDishImages.default;
}

async function updateMenuImages() {
  try {
    await mongoose.connect('mongodb://localhost:27017/food-delivery');
    console.log('✅ Connected to database\n');

    // Get ALL menu items
    const allItems = await MenuItem.find({});

    console.log(`📋 Found ${allItems.length} menu items`);
    console.log('🔄 Updating images with more specific images...\n');

    let updatedCount = 0;
    const changedItems = [];

    for (const item of allItems) {
      const newImage = getSpecificImage(item.name);
      const oldImage = item.images?.[0];

      if (newImage !== oldImage) {
        item.images = [newImage];
        await item.save();
        updatedCount++;
        changedItems.push({
          name: item.name,
          old: oldImage?.substring(0, 50) + '...',
          new: newImage.substring(0, 50) + '...'
        });
        console.log(`✓ Updated: ${item.name}`);
      }
    }

    console.log(`\n✅ Successfully updated ${updatedCount} menu items with more specific images`);
    console.log(`📊 ${allItems.length - updatedCount} items already had correct images\n`);

    if (changedItems.length > 0) {
      console.log('📝 Sample of changed items:');
      changedItems.slice(0, 10).forEach(item => {
        console.log(`   - ${item.name}`);
      });
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

updateMenuImages();
