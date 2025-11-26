const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('./src/models/User');
const Restaurant = require('./src/models/Restaurant');
const MenuItem = require('./src/models/MenuItem');

const seedMaduraiData = async () => {
  try {
    console.log('🌱 Starting to seed Madurai restaurant data...\n');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Clear existing data
    await Restaurant.deleteMany({});
    await MenuItem.deleteMany({});
    console.log('🗑️  Cleared existing restaurants and menu items\n');

    // Create vendor users if they don't exist
    const hashedPassword = await bcrypt.hash('password123', 12);

    const vendor1 = await User.findOneAndUpdate(
      { email: 'meenakshi@vendor.com' },
      {
        name: 'Meenakshi Restaurant Owner',
        email: 'meenakshi@vendor.com',
        password: hashedPassword,
        phone: '+919876501001',
        role: 'vendor',
        isActive: true
      },
      { upsert: true, new: true }
    );

    const vendor2 = await User.findOneAndUpdate(
      { email: 'annapoorna@vendor.com' },
      {
        name: 'Annapoorna Hotel Owner',
        email: 'annapoorna@vendor.com',
        password: hashedPassword,
        phone: '+919876501002',
        role: 'vendor',
        isActive: true
      },
      { upsert: true, new: true }
    );

    const vendor3 = await User.findOneAndUpdate(
      { email: 'kurinji@vendor.com' },
      {
        name: 'Kurinji Biryani Owner',
        email: 'kurinji@vendor.com',
        password: hashedPassword,
        phone: '+919876501003',
        role: 'vendor',
        isActive: true
      },
      { upsert: true, new: true }
    );

    const vendor4 = await User.findOneAndUpdate(
      { email: 'temple@vendor.com' },
      {
        name: 'Temple City Cafe Owner',
        email: 'temple@vendor.com',
        password: hashedPassword,
        phone: '+919876501004',
        role: 'vendor',
        isActive: true
      },
      { upsert: true, new: true }
    );

    const vendor5 = await User.findOneAndUpdate(
      { email: 'pandian@vendor.com' },
      {
        name: 'Pandian Foods Owner',
        email: 'pandian@vendor.com',
        password: hashedPassword,
        phone: '+919876501005',
        role: 'vendor',
        isActive: true
      },
      { upsert: true, new: true }
    );

    console.log('✅ Created vendor users\n');

    // Madurai coordinates (near Meenakshi Temple)
    const maduraiCoordinates = {
      meenakshiTemple: [78.1194, 9.9195],
      ssColony: [78.1420, 9.9252],
      annapoornagar: [78.1568, 9.9174],
      kKNagar: [78.1332, 9.9067],
      gandhiNagar: [78.1078, 9.9389]
    };

    // Create Restaurants in Madurai
    const restaurant1 = await Restaurant.create({
      name: 'Meenakshi Bhavan',
      ownerId: vendor1._id,
      description: 'Authentic South Indian vegetarian cuisine near the famous Meenakshi Temple',
      cuisines: ['South Indian', 'Indian', 'Vegetarian'],
      location: {
        street: '45 East Avani Moola Street',
        city: 'Madurai',
        state: 'Tamil Nadu',
        zipCode: '625001',
        country: 'India',
        coordinates: {
          type: 'Point',
          coordinates: maduraiCoordinates.meenakshiTemple
        }
      },
      contactInfo: {
        phone: '+914522345001',
        email: 'contact@meenakshibhavan.com'
      },
      openingHours: [
        { day: 'Monday', open: '06:00', close: '22:00' },
        { day: 'Tuesday', open: '06:00', close: '22:00' },
        { day: 'Wednesday', open: '06:00', close: '22:00' },
        { day: 'Thursday', open: '06:00', close: '22:00' },
        { day: 'Friday', open: '06:00', close: '22:00' },
        { day: 'Saturday', open: '06:00', close: '22:00' },
        { day: 'Sunday', open: '06:00', close: '22:00' }
      ],
      deliveryTime: { min: 25, max: 40 },
      minimumOrder: 150,
      deliveryFee: 30,
      rating: { average: 4.7, count: 520 },
      isOpen: true,
      isActive: true,
      isApproved: true,
      pricing: '$$'
    });

    const restaurant2 = await Restaurant.create({
      name: 'Annapoorna Gowrishankar',
      ownerId: vendor2._id,
      description: 'Traditional Tamil Nadu meals and tiffin items, famous for filter coffee',
      cuisines: ['South Indian', 'Indian', 'Vegetarian', 'Breakfast'],
      location: {
        street: '12 West Perumal Maistry Street',
        city: 'Madurai',
        state: 'Tamil Nadu',
        zipCode: '625002',
        country: 'India',
        coordinates: {
          type: 'Point',
          coordinates: maduraiCoordinates.ssColony
        }
      },
      contactInfo: {
        phone: '+914522345002',
        email: 'contact@annapoorna.com'
      },
      openingHours: [
        { day: 'Monday', open: '06:30', close: '22:30' },
        { day: 'Tuesday', open: '06:30', close: '22:30' },
        { day: 'Wednesday', open: '06:30', close: '22:30' },
        { day: 'Thursday', open: '06:30', close: '22:30' },
        { day: 'Friday', open: '06:30', close: '22:30' },
        { day: 'Saturday', open: '06:30', close: '22:30' },
        { day: 'Sunday', open: '06:30', close: '22:30' }
      ],
      deliveryTime: { min: 30, max: 45 },
      minimumOrder: 180,
      deliveryFee: 35,
      rating: { average: 4.8, count: 850 },
      isOpen: true,
      isActive: true,
      isApproved: true,
      pricing: '$$'
    });

    const restaurant3 = await Restaurant.create({
      name: 'Kurinji Biryani House',
      ownerId: vendor3._id,
      description: 'Madurai style biryani and non-veg specialties, must-try mutton biryani',
      cuisines: ['Biryani', 'Indian', 'South Indian', 'Non-Vegetarian'],
      location: {
        street: '23 Bypass Road',
        city: 'Madurai',
        state: 'Tamil Nadu',
        zipCode: '625010',
        country: 'India',
        coordinates: {
          type: 'Point',
          coordinates: maduraiCoordinates.annapoornagar
        }
      },
      contactInfo: {
        phone: '+914522345003',
        email: 'contact@kurinjibiryani.com'
      },
      openingHours: [
        { day: 'Monday', open: '11:00', close: '23:00' },
        { day: 'Tuesday', open: '11:00', close: '23:00' },
        { day: 'Wednesday', open: '11:00', close: '23:00' },
        { day: 'Thursday', open: '11:00', close: '23:00' },
        { day: 'Friday', open: '11:00', close: '23:00' },
        { day: 'Saturday', open: '11:00', close: '23:00' },
        { day: 'Sunday', open: '11:00', close: '23:00' }
      ],
      deliveryTime: { min: 35, max: 50 },
      minimumOrder: 200,
      deliveryFee: 40,
      rating: { average: 4.6, count: 640 },
      isOpen: true,
      isActive: true,
      isApproved: true,
      pricing: '$$'
    });

    const restaurant4 = await Restaurant.create({
      name: 'Temple City Cafe',
      ownerId: vendor4._id,
      description: 'Multi-cuisine restaurant with Chinese, North Indian and Continental dishes',
      cuisines: ['Chinese', 'North Indian', 'Continental', 'Fast Food'],
      location: {
        street: '78 K.K. Nagar Main Road',
        city: 'Madurai',
        state: 'Tamil Nadu',
        zipCode: '625020',
        country: 'India',
        coordinates: {
          type: 'Point',
          coordinates: maduraiCoordinates.kKNagar
        }
      },
      contactInfo: {
        phone: '+914522345004',
        email: 'contact@templecitycafe.com'
      },
      openingHours: [
        { day: 'Monday', open: '10:00', close: '23:00' },
        { day: 'Tuesday', open: '10:00', close: '23:00' },
        { day: 'Wednesday', open: '10:00', close: '23:00' },
        { day: 'Thursday', open: '10:00', close: '23:00' },
        { day: 'Friday', open: '10:00', close: '23:30' },
        { day: 'Saturday', open: '10:00', close: '23:30' },
        { day: 'Sunday', open: '10:00', close: '23:00' }
      ],
      deliveryTime: { min: 30, max: 45 },
      minimumOrder: 180,
      deliveryFee: 35,
      rating: { average: 4.5, count: 410 },
      isOpen: true,
      isActive: true,
      isApproved: true,
      pricing: '$$'
    });

    const restaurant5 = await Restaurant.create({
      name: 'Pandian Hotel',
      ownerId: vendor5._id,
      description: 'Famous for Chettinad cuisine, parotta and chicken dishes since 1952',
      cuisines: ['Chettinad', 'South Indian', 'Non-Vegetarian', 'Indian'],
      location: {
        street: '15 Town Hall Road',
        city: 'Madurai',
        state: 'Tamil Nadu',
        zipCode: '625001',
        country: 'India',
        coordinates: {
          type: 'Point',
          coordinates: maduraiCoordinates.gandhiNagar
        }
      },
      contactInfo: {
        phone: '+914522345005',
        email: 'contact@pandianhotel.com'
      },
      openingHours: [
        { day: 'Monday', open: '07:00', close: '23:00' },
        { day: 'Tuesday', open: '07:00', close: '23:00' },
        { day: 'Wednesday', open: '07:00', close: '23:00' },
        { day: 'Thursday', open: '07:00', close: '23:00' },
        { day: 'Friday', open: '07:00', close: '23:00' },
        { day: 'Saturday', open: '07:00', close: '23:00' },
        { day: 'Sunday', open: '07:00', close: '23:00' }
      ],
      deliveryTime: { min: 30, max: 45 },
      minimumOrder: 160,
      deliveryFee: 30,
      rating: { average: 4.7, count: 920 },
      isOpen: true,
      isActive: true,
      isApproved: true,
      pricing: '$$'
    });

    console.log('✅ Created 5 restaurants in Madurai\n');

    // Create Menu Items for Meenakshi Bhavan (South Indian Veg)
    const meenakshiItems = await MenuItem.insertMany([
      {
        restaurantId: restaurant1._id,
        name: 'Masala Dosa',
        description: 'Crispy rice crepe filled with spiced potato masala, served with sambar and chutneys',
        price: 65,
        category: 'Breakfast',
        isVeg: true,
        isAvailable: true,
        preparationTime: 15,
        images: []
      },
      {
        restaurantId: restaurant1._id,
        name: 'Idli Sambar (3 Pcs)',
        description: 'Soft steamed rice cakes served with piping hot sambar and coconut chutney',
        price: 45,
        category: 'Breakfast',
        isVeg: true,
        isAvailable: true,
        preparationTime: 10,
        images: []
      },
      {
        restaurantId: restaurant1._id,
        name: 'Madurai Special Meals',
        description: 'Traditional unlimited South Indian thali with rice, sambar, rasam, poriyal, kootu, curd',
        price: 150,
        category: 'Meals',
        isVeg: true,
        isAvailable: true,
        preparationTime: 20,
        images: []
      },
      {
        restaurantId: restaurant1._id,
        name: 'Pongal',
        description: 'Comforting rice and lentil dish cooked with ghee, pepper and cumin',
        price: 55,
        category: 'Breakfast',
        isVeg: true,
        isAvailable: true,
        preparationTime: 12,
        images: []
      },
      {
        restaurantId: restaurant1._id,
        name: 'Rava Kesari',
        description: 'Traditional South Indian sweet made with semolina, ghee, sugar and nuts',
        price: 50,
        category: 'Desserts',
        isVeg: true,
        isAvailable: true,
        preparationTime: 8,
        images: []
      },
      {
        restaurantId: restaurant1._id,
        name: 'Filter Coffee',
        description: 'Authentic South Indian filter coffee with chicory',
        price: 30,
        category: 'Beverages',
        isVeg: true,
        isAvailable: true,
        preparationTime: 5,
        images: []
      },
      {
        restaurantId: restaurant1._id,
        name: 'Vada (2 Pcs)',
        description: 'Crispy fried lentil donuts served with sambar and chutney',
        price: 40,
        category: 'Breakfast',
        isVeg: true,
        isAvailable: true,
        preparationTime: 12,
        images: []
      }
    ]);

    // Create Menu Items for Annapoorna Gowrishankar
    const annapoornaItems = await MenuItem.insertMany([
      {
        restaurantId: restaurant2._id,
        name: 'Mini Tiffin',
        description: '2 Idli + 1 Vada + 1 Dosa combo with sambar and chutneys',
        price: 120,
        category: 'Combos',
        isVeg: true,
        isAvailable: true,
        preparationTime: 18,
        images: []
      },
      {
        restaurantId: restaurant2._id,
        name: 'Poori Masala',
        description: 'Fluffy deep-fried bread served with potato masala curry',
        price: 70,
        category: 'Breakfast',
        isVeg: true,
        isAvailable: true,
        preparationTime: 15,
        images: []
      },
      {
        restaurantId: restaurant2._id,
        name: 'Curd Rice',
        description: 'Cooling rice mixed with yogurt, tempered with curry leaves and mustard',
        price: 65,
        category: 'Rice',
        isVeg: true,
        isAvailable: true,
        preparationTime: 10,
        images: []
      },
      {
        restaurantId: restaurant2._id,
        name: 'Ghee Roast Dosa',
        description: 'Paper thin crispy dosa roasted in pure ghee',
        price: 85,
        category: 'Dosas',
        isVeg: true,
        isAvailable: true,
        preparationTime: 15,
        images: []
      },
      {
        restaurantId: restaurant2._id,
        name: 'Vegetable Pulao',
        description: 'Fragrant basmati rice cooked with mixed vegetables and spices',
        price: 110,
        category: 'Rice',
        isVeg: true,
        isAvailable: true,
        preparationTime: 20,
        images: []
      },
      {
        restaurantId: restaurant2._id,
        name: 'Paneer Butter Masala',
        description: 'Cottage cheese cubes in creamy tomato gravy',
        price: 180,
        category: 'Main Course',
        isVeg: true,
        isAvailable: true,
        preparationTime: 25,
        images: []
      },
      {
        restaurantId: restaurant2._id,
        name: 'Mysore Bonda (6 Pcs)',
        description: 'Fluffy deep-fried lentil fritters, perfect with coffee',
        price: 45,
        category: 'Snacks',
        isVeg: true,
        isAvailable: true,
        preparationTime: 12,
        images: []
      }
    ]);

    // Create Menu Items for Kurinji Biryani House
    const kurinjiItems = await MenuItem.insertMany([
      {
        restaurantId: restaurant3._id,
        name: 'Mutton Biryani',
        description: 'Signature Madurai style biryani with tender mutton pieces and fragrant spices',
        price: 280,
        category: 'Biryani',
        isVeg: false,
        isAvailable: true,
        preparationTime: 35,
        images: []
      },
      {
        restaurantId: restaurant3._id,
        name: 'Chicken Biryani',
        description: 'Aromatic biryani with succulent chicken pieces marinated in special spices',
        price: 220,
        category: 'Biryani',
        isVeg: false,
        isAvailable: true,
        preparationTime: 30,
        images: []
      },
      {
        restaurantId: restaurant3._id,
        name: 'Chicken 65',
        description: 'Spicy deep-fried chicken appetizer with curry leaves',
        price: 180,
        category: 'Starters',
        isVeg: false,
        isAvailable: true,
        preparationTime: 20,
        images: []
      },
      {
        restaurantId: restaurant3._id,
        name: 'Egg Biryani',
        description: 'Flavorful biryani with boiled eggs cooked in aromatic spices',
        price: 150,
        category: 'Biryani',
        isVeg: false,
        isAvailable: true,
        preparationTime: 25,
        images: []
      },
      {
        restaurantId: restaurant3._id,
        name: 'Mutton Chukka',
        description: 'Dry mutton preparation with caramelized onions and roasted spices',
        price: 260,
        category: 'Main Course',
        isVeg: false,
        isAvailable: true,
        preparationTime: 30,
        images: []
      },
      {
        restaurantId: restaurant3._id,
        name: 'Raita',
        description: 'Cooling yogurt with cucumber, onions and spices',
        price: 40,
        category: 'Sides',
        isVeg: true,
        isAvailable: true,
        preparationTime: 5,
        images: []
      },
      {
        restaurantId: restaurant3._id,
        name: 'Chicken Kebab',
        description: 'Grilled chicken skewers marinated in yogurt and spices',
        price: 200,
        category: 'Starters',
        isVeg: false,
        isAvailable: true,
        preparationTime: 25,
        images: []
      }
    ]);

    // Create Menu Items for Temple City Cafe
    const templeCityItems = await MenuItem.insertMany([
      {
        restaurantId: restaurant4._id,
        name: 'Chicken Fried Rice',
        description: 'Indo-Chinese style fried rice with vegetables and chicken',
        price: 160,
        category: 'Rice',
        isVeg: false,
        isAvailable: true,
        preparationTime: 20,
        images: []
      },
      {
        restaurantId: restaurant4._id,
        name: 'Paneer Chilli',
        description: 'Cottage cheese cubes tossed in spicy Indo-Chinese sauce',
        price: 170,
        category: 'Starters',
        isVeg: true,
        isAvailable: true,
        preparationTime: 18,
        images: []
      },
      {
        restaurantId: restaurant4._id,
        name: 'Hakka Noodles',
        description: 'Stir-fried noodles with vegetables in garlic sauce',
        price: 140,
        category: 'Noodles',
        isVeg: true,
        isAvailable: true,
        preparationTime: 18,
        images: []
      },
      {
        restaurantId: restaurant4._id,
        name: 'Butter Chicken',
        description: 'Classic North Indian chicken in rich tomato butter gravy',
        price: 240,
        category: 'Main Course',
        isVeg: false,
        isAvailable: true,
        preparationTime: 25,
        images: []
      },
      {
        restaurantId: restaurant4._id,
        name: 'Garlic Naan',
        description: 'Soft leavened bread topped with garlic and butter',
        price: 50,
        category: 'Breads',
        isVeg: true,
        isAvailable: true,
        preparationTime: 12,
        images: []
      },
      {
        restaurantId: restaurant4._id,
        name: 'Gobi Manchurian',
        description: 'Crispy cauliflower fritters in tangy Manchurian sauce',
        price: 150,
        category: 'Starters',
        isVeg: true,
        isAvailable: true,
        preparationTime: 20,
        images: []
      },
      {
        restaurantId: restaurant4._id,
        name: 'Chicken Lollipop (6 Pcs)',
        description: 'Chicken wings marinated and deep-fried to perfection',
        price: 200,
        category: 'Starters',
        isVeg: false,
        isAvailable: true,
        preparationTime: 25,
        images: []
      }
    ]);

    // Create Menu Items for Pandian Hotel (Chettinad)
    const pandianItems = await MenuItem.insertMany([
      {
        restaurantId: restaurant5._id,
        name: 'Chettinad Chicken',
        description: 'Traditional spicy chicken curry with roasted spices and coconut',
        price: 220,
        category: 'Main Course',
        isVeg: false,
        isAvailable: true,
        preparationTime: 30,
        images: []
      },
      {
        restaurantId: restaurant5._id,
        name: 'Parotta (2 Pcs)',
        description: 'Flaky layered flatbread, perfect with chicken curry',
        price: 40,
        category: 'Breads',
        isVeg: true,
        isAvailable: true,
        preparationTime: 12,
        images: []
      },
      {
        restaurantId: restaurant5._id,
        name: 'Mutton Varuval',
        description: 'Dry roasted mutton with Chettinad spices and curry leaves',
        price: 280,
        category: 'Main Course',
        isVeg: false,
        isAvailable: true,
        preparationTime: 35,
        images: []
      },
      {
        restaurantId: restaurant5._id,
        name: 'Chicken Kothu Parotta',
        description: 'Shredded parotta stir-fried with chicken, eggs and spices',
        price: 160,
        category: 'Specials',
        isVeg: false,
        isAvailable: true,
        preparationTime: 20,
        images: []
      },
      {
        restaurantId: restaurant5._id,
        name: 'Fish Fry',
        description: 'Crispy fried fish marinated in South Indian spices',
        price: 200,
        category: 'Starters',
        isVeg: false,
        isAvailable: true,
        preparationTime: 25,
        images: []
      },
      {
        restaurantId: restaurant5._id,
        name: 'Kola Urundai',
        description: 'Spiced meatballs deep-fried to perfection',
        price: 180,
        category: 'Starters',
        isVeg: false,
        isAvailable: true,
        preparationTime: 20,
        images: []
      },
      {
        restaurantId: restaurant5._id,
        name: 'Chettinad Egg Curry',
        description: 'Boiled eggs in spicy Chettinad style gravy',
        price: 140,
        category: 'Main Course',
        isVeg: false,
        isAvailable: true,
        preparationTime: 20,
        images: []
      }
    ]);

    console.log('✅ Created menu items for all 5 restaurants\n');

    console.log('═══════════════════════════════════════════════════════');
    console.log('🎉 MADURAI RESTAURANT DATA SEEDED SUCCESSFULLY!');
    console.log('═══════════════════════════════════════════════════════\n');

    console.log('📊 Summary:');
    console.log('   ✅ 5 Restaurants in Madurai created');
    console.log('   ✅ 35 Menu items created (7 items per restaurant)');
    console.log('   ✅ 5 Vendor accounts created\n');

    console.log('🏪 Restaurants in Madurai:');
    console.log('   1. Meenakshi Bhavan (South Indian Veg) - 7 items');
    console.log('   2. Annapoorna Gowrishankar (Tiffin & Meals) - 7 items');
    console.log('   3. Kurinji Biryani House (Biryani Specialist) - 7 items');
    console.log('   4. Temple City Cafe (Multi-Cuisine) - 7 items');
    console.log('   5. Pandian Hotel (Chettinad Cuisine) - 7 items\n');

    console.log('👥 Vendor Accounts (can login to manage):');
    console.log('   • meenakshi@vendor.com / password123 (Meenakshi Bhavan)');
    console.log('   • annapoorna@vendor.com / password123 (Annapoorna Gowrishankar)');
    console.log('   • kurinji@vendor.com / password123 (Kurinji Biryani House)');
    console.log('   • temple@vendor.com / password123 (Temple City Cafe)');
    console.log('   • pandian@vendor.com / password123 (Pandian Hotel)\n');

    console.log('📍 All restaurants are located in Madurai, Tamil Nadu');
    console.log('🌐 Refresh your browser at http://localhost:5173');
    console.log('   You should now see 5 Madurai restaurants with full menus!\n');

    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB\n');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
};

seedMaduraiData();
