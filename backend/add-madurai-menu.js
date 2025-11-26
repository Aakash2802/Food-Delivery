const mongoose = require('mongoose');
const MenuItem = require('./src/models/MenuItem');

const menuItems = [
  // Signature Madurai Dishes
  {
    name: 'Kari Dosa',
    description: 'Authentic Madurai style dosa topped with spicy minced mutton keema, onions, and special masala',
    category: 'Signature Dishes',
    price: 180,
    restaurantId: '691432226033d14a068e0ecb',
    isVeg: false,
    isVegan: false,
    spiceLevel: 'hot',
    preparationTime: 25,
    isAvailable: true,
    images: ['https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=500']
  },
  {
    name: 'Mutton Kola Urundai',
    description: 'Traditional Madurai style mutton meatballs with aromatic spices, deep fried to perfection',
    category: 'Mutton Specials',
    price: 280,
    restaurantId: '691432226033d14a068e0ecb',
    isVeg: false,
    spiceLevel: 'medium',
    preparationTime: 35,
    isAvailable: true,
    images: ['https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=500']
  },
  {
    name: 'Madurai Mutton Chukka',
    description: 'Dry mutton curry with roasted spices, curry leaves, and coconut - a Madurai classic',
    category: 'Mutton Specials',
    price: 320,
    restaurantId: '691432226033d14a068e0ecb',
    isVeg: false,
    spiceLevel: 'hot',
    preparationTime: 40,
    isAvailable: true,
    images: ['https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=500']
  },
  {
    name: 'Madurai Style Mutton Biryani',
    description: 'Aromatic biryani with tender mutton pieces, seeraga samba rice, and traditional Madurai spices',
    category: 'Biryani',
    price: 350,
    restaurantId: '691432226033d14a068e0ecb',
    isVeg: false,
    spiceLevel: 'medium',
    preparationTime: 45,
    isAvailable: true,
    images: ['https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500']
  },
  {
    name: 'Mutton Liver Fry',
    description: 'Spicy mutton liver stir-fried with onions, curry leaves, and traditional Madurai masala',
    category: 'Mutton Specials',
    price: 240,
    restaurantId: '691432226033d14a068e0ecb',
    isVeg: false,
    spiceLevel: 'hot',
    preparationTime: 25,
    isAvailable: true
  },

  // Chicken Dishes
  {
    name: 'Chicken 65',
    description: 'Crispy deep-fried chicken marinated with yogurt, ginger-garlic, and spices - Madurai style',
    category: 'Chicken Specials',
    price: 220,
    restaurantId: '691432226033d14a068e0ecb',
    isVeg: false,
    spiceLevel: 'hot',
    preparationTime: 20,
    isAvailable: true,
    images: ['https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=500']
  },
  {
    name: 'Madurai Chicken Chettinad',
    description: 'Spicy chicken curry with roasted chettinad masala, coconut, and curry leaves',
    category: 'Chicken Specials',
    price: 260,
    restaurantId: '691432226033d14a068e0ecb',
    isVeg: false,
    spiceLevel: 'extra-hot',
    preparationTime: 35,
    isAvailable: true,
    images: ['https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=500']
  },
  {
    name: 'Chicken Varuval',
    description: 'Dry roasted chicken with onions, tomatoes, and traditional spices',
    category: 'Chicken Specials',
    price: 240,
    restaurantId: '691432226033d14a068e0ecb',
    isVeg: false,
    spiceLevel: 'medium',
    preparationTime: 30,
    isAvailable: true
  },
  {
    name: 'Madurai Chicken Biryani',
    description: 'Fragrant chicken biryani with seeraga samba rice and Madurai special masala',
    category: 'Biryani',
    price: 280,
    restaurantId: '691432226033d14a068e0ecb',
    isVeg: false,
    spiceLevel: 'medium',
    preparationTime: 40,
    isAvailable: true,
    images: ['https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500']
  },

  // Fish Dishes
  {
    name: 'Meen Kuzhambu',
    description: 'Traditional Madurai fish curry with tamarind, tomatoes, and aromatic spices',
    category: 'Fish Specials',
    price: 280,
    restaurantId: '691432226033d14a068e0ecb',
    isVeg: false,
    spiceLevel: 'hot',
    preparationTime: 30,
    isAvailable: true,
    images: ['https://images.unsplash.com/photo-1534766438357-2b18cd1b7f7e?w=500']
  },
  {
    name: 'Fish Fry (Nethili/Sardine)',
    description: 'Crispy fried sardines marinated with turmeric, chili powder, and curry leaves',
    category: 'Fish Specials',
    price: 200,
    restaurantId: '691432226033d14a068e0ecb',
    isVeg: false,
    spiceLevel: 'medium',
    preparationTime: 20,
    isAvailable: true,
    images: ['https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=500']
  },
  {
    name: 'Pomfret Fry',
    description: 'Whole pomfret marinated with special masala and shallow fried',
    category: 'Fish Specials',
    price: 380,
    restaurantId: '691432226033d14a068e0ecb',
    isVeg: false,
    spiceLevel: 'medium',
    preparationTime: 25,
    isAvailable: true,
    images: ['https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=500']
  },
  {
    name: 'Prawn Masala',
    description: 'Juicy prawns cooked in thick tomato and onion gravy with Madurai spices',
    category: 'Fish Specials',
    price: 350,
    restaurantId: '691432226033d14a068e0ecb',
    isVeg: false,
    spiceLevel: 'hot',
    preparationTime: 25,
    isAvailable: true,
    images: ['https://images.unsplash.com/photo-1559737558-2f5a32d7f332?w=500']
  },

  // Additional Madurai Specialties
  {
    name: 'Parotta with Salna',
    description: 'Flaky layered parotta served with spicy vegetable or chicken salna',
    category: 'Breads & Combos',
    price: 120,
    restaurantId: '691432226033d14a068e0ecb',
    isVeg: false,
    spiceLevel: 'medium',
    preparationTime: 15,
    isAvailable: true,
    customizations: [{
      name: 'Salna Choice',
      options: [
        { label: 'Vegetable Salna', price: 0, isDefault: true },
        { label: 'Chicken Salna', price: 40 },
        { label: 'Mutton Salna', price: 60 }
      ],
      isRequired: true,
      maxSelections: 1
    }]
  },
  {
    name: 'Jigarthanda',
    description: 'Famous Madurai cold beverage with milk, almond gum, nannari syrup, and ice cream',
    category: 'Beverages',
    price: 80,
    restaurantId: '691432226033d14a068e0ecb',
    isVeg: true,
    isVegan: false,
    preparationTime: 10,
    isAvailable: true,
    images: ['https://images.unsplash.com/photo-1546173159-315724a31696?w=500']
  },
  {
    name: 'Paruthi Paal',
    description: 'Traditional cottonseed milk drink sweetened with jaggery - a Madurai favorite',
    category: 'Beverages',
    price: 60,
    restaurantId: '691432226033d14a068e0ecb',
    isVeg: true,
    isVegan: true,
    preparationTime: 5,
    isAvailable: true
  },
  {
    name: 'Bun Parotta',
    description: 'Soft layered bun parotta served with kurma - a Madurai street food favorite',
    category: 'Breads & Combos',
    price: 80,
    restaurantId: '691432226033d14a068e0ecb',
    isVeg: true,
    preparationTime: 15,
    isAvailable: true
  }
];

mongoose.connect('mongodb://localhost:27017/food-delivery').then(async () => {
  console.log('✅ Connected to database');

  // Insert all menu items
  const result = await MenuItem.insertMany(menuItems);
  console.log('✅ Successfully added', result.length, 'menu items to New Mass restaurant');

  // Display summary by category
  const categories = {};
  result.forEach(item => {
    if (!categories[item.category]) categories[item.category] = 0;
    categories[item.category]++;
  });

  console.log('\n📋 Menu Summary:');
  Object.entries(categories).forEach(([category, count]) => {
    console.log('   -', category + ':', count, 'items');
  });

  console.log('\n🍽️  Featured Madurai Items:');
  console.log('   - Kari Dosa (Signature)');
  console.log('   - Madurai Mutton Biryani');
  console.log('   - Madurai Chicken Chettinad');
  console.log('   - Meen Kuzhambu');
  console.log('   - Jigarthanda');

  process.exit();
}).catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
