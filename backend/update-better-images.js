const mongoose = require('mongoose');
const MenuItem = require('./src/models/MenuItem');

// Better, more accurate images for each specific dish
const betterDishImages = {
  // Meenakshi Bhavan (South Indian)
  'masala dosa': 'https://images.unsplash.com/photo-1694849789325-914b71ab4075?q=80&w=800&auto=format&fit=crop',
  'idli sambar (3 pcs)': 'https://cdn.pixabay.com/photo/2017/06/16/11/38/breakfast-2408818_1280.jpg',
  'madurai special meals': 'https://i.ytimg.com/vi/m9j9qSXbs_4/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLCbhpEVM4KOooEpbQbl8HIonb7U4g',
  'pongal': 'https://www.yummyfoodrecipes.com/resources/picture/org/Ven-pongal.jpg',
  'rava kesari': 'https://cookingfromheart.com/wp-content/uploads/2017/08/Rava-Kesari-6-500x500.jpg',
  'filter coffee': 'https://images.pexels.com/photos/33932441/pexels-photo-33932441.png',
  'vada (2 pcs)': 'https://cdn.pixabay.com/photo/2021/06/03/01/37/parippu-vada-6305692_1280.jpg',

  // Annapoorna Gowrishankar
  'mini tiffin': 'https://images.pexels.com/photos/14831540/pexels-photo-14831540.jpeg',
  'poori masala': 'https://cdn.pixabay.com/photo/2016/11/23/18/31/indian-food-1854247_1280.jpg',
  'curd rice': 'https://images.unsplash.com/photo-1633383718081-22ac93e3db65?w=800&q=80',
  'ghee roast dosa': 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=800&q=80',
  'vegetable pulao': 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&q=80',
  'paneer butter masala': 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800&q=80',
  'mysore bonda (6 pcs)': 'https://images.pexels.com/photos/17659370/pexels-photo-17659370.jpeg',

  // Kurinji Biryani House
  'mutton biryani': 'https://www.awesomecuisine.com/wp-content/uploads/2012/11/Chettinad-Mutton-Biryani.jpg',
  'chicken biryani': 'https://vismaifood.com/storage/app/uploads/public/914/f47/fa9/thumb__1200_0_0_0_auto.jpg',
  'chicken 65': 'https://pupswithchopsticks.com/wp-content/uploads/chicken-manchurian-tnnew.webp',
  'chicken manchurian': 'https://pupswithchopsticks.com/wp-content/uploads/chicken-manchurian-tnnew.webp',
  'egg biryani': 'https://www.pavaniskitchen.com/wp-content/uploads/2021/04/egg-biryani-recipe.jpg',
  'mutton chukka': 'https://i.ytimg.com/vi/xMdhea4fLjU/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLCpYdTQOCF9hIv_49vPKriuga6aIw',
  'prawn gravy': 'https://i.ytimg.com/vi/xMdhea4fLjU/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLCpYdTQOCF9hIv_49vPKriuga6aIw',
  'raita': 'https://i0.wp.com/www.chitrasfoodbook.com/wp-content/uploads/2016/10/gulab-jamun-using-mix.jpg?w=1200&ssl=1',
  'gulab jamun (4 pcs)': 'https://i0.wp.com/www.chitrasfoodbook.com/wp-content/uploads/2016/10/gulab-jamun-using-mix.jpg?w=1200&ssl=1',
  'chicken kebab': 'https://static.toiimg.com/photo/58360750.cms',
  'mutton kebab': 'https://static.toiimg.com/photo/58360750.cms',

  // Temple City Cafe (Pure Veg)
  'vegetable fried rice': 'https://www.shutterstock.com/image-photo/vegetable-fried-rice-260nw-1764071782.jpg',
  'paneer chilli': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSLL7ELazVbZPsu6A-qDZrMCtq9h6ZR8iMGMA&s',
  'hakka noodles': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT89FGhd8AgfBheeK4V_IDWnVmRtq2Df_xa8w&s',
  'paniyaram (7 pcs)': 'https://i0.wp.com/www.chitrasfoodbook.com/wp-content/uploads/2024/01/karupatti-paniyaram-recipe.jpg?resize=500%2C500&ssl=1',
  'garlic naan': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSnByqBzBieOmLO3pwylDSVKvHavh7u0unFuJcmlfw9s912p1-V-zUZejwjmrqkYl4twok&usqp=CAU',
  'garlic naan (2 pcs)': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSnByqBzBieOmLO3pwylDSVKvHavh7u0unFuJcmlfw9s912p1-V-zUZejwjmrqkYl4twok&usqp=CAU',
  'gobi manchurian': 'https://www.indianhealthyrecipes.com/wp-content/uploads/2022/02/gobi-manchurian-cauliflower-manchurian.jpg',
  'veg spring rolls (6 pcs)': 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=800&q=80',

  // Pandian Hotel (Chettinad)
  'chettinad chicken': 'https://madscookhouse.com/wp-content/uploads/2021/02/Chicken-Chettinad-500x375.jpg',
  'parotta (2 pcs)': 'https://b.zmtcdn.com/data/dish_photos/1ba/d51537e980bcb112da0e68b9a49001ba.jpg',
  'mutton varuval': 'https://www.freshtohome.com/blog/wp-content/uploads/2024/06/Screenshot-2024-06-27-130844.png',
  'mutton sukka': 'https://www.freshtohome.com/blog/wp-content/uploads/2024/06/Screenshot-2024-06-27-130844.png',
  'chicken kothu parotta': 'https://anjapparoc.com/wp-content/uploads/2024/03/kothu-scaled.jpg',
  'fish fry': 'https://i.ytimg.com/vi/jLrHENui4vU/maxresdefault.jpg',
  'kola urundai': 'https://melam.com/wp-content/uploads/2022/12/madurai-mutton-kolai-urundai.jpg',
  'kola urundai (2 pcs)': 'https://melam.com/wp-content/uploads/2022/12/madurai-mutton-kolai-urundai.jpg',
  'chettinad egg curry': 'https://www.blog.123coimbatore.com/uploads/blog-images/17-02-2018_05-17-34_Egg-Curry-Recipe.jpg',
};

async function updateBetterImages() {
  try {
    await mongoose.connect('mongodb://localhost:27017/food-delivery');
    console.log('✅ Connected to database\n');

    const allItems = await MenuItem.find({});
    console.log(`📋 Found ${allItems.length} menu items`);
    console.log('🔄 Updating with better quality images...\n');

    let updatedCount = 0;

    for (const item of allItems) {
      const itemKey = item.name.toLowerCase().trim();
      const newImage = betterDishImages[itemKey];

      if (newImage) {
        item.images = [newImage];
        await item.save();
        updatedCount++;
        console.log(`✓ Updated: ${item.name} -> Better quality image`);
      } else {
        console.log(`⚠ No specific image for: ${item.name}`);
      }
    }

    console.log(`\n✅ Successfully updated ${updatedCount}/${allItems.length} menu items with better images`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

updateBetterImages();
