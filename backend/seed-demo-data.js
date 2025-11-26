const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('./src/models/User');
const Restaurant = require('./src/models/Restaurant');
const MenuItem = require('./src/models/MenuItem');

const seedData = async () => {
  try {
    console.log('🌱 Starting to seed demo data...\n');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Clear existing data (optional - comment out if you want to keep existing data)
    await Restaurant.deleteMany({});
    await MenuItem.deleteMany({});
    console.log('🗑️  Cleared existing restaurants and menu items\n');

    // Create vendor users if they don't exist
    const hashedPassword = await bcrypt.hash('password123', 12);

    const vendor1 = await User.findOneAndUpdate(
      { email: 'vendor1@test.com' },
      {
        name: 'Pizza Palace Owner',
        email: 'vendor1@test.com',
        password: hashedPassword,
        phone: '+919876543220',
        role: 'vendor',
        isActive: true
      },
      { upsert: true, new: true }
    );

    const vendor2 = await User.findOneAndUpdate(
      { email: 'vendor2@test.com' },
      {
        name: 'Burger Bistro Owner',
        email: 'vendor2@test.com',
        password: hashedPassword,
        phone: '+919876543221',
        role: 'vendor',
        isActive: true
      },
      { upsert: true, new: true }
    );

    const vendor3 = await User.findOneAndUpdate(
      { email: 'vendor3@test.com' },
      {
        name: 'Indian Spice Owner',
        email: 'vendor3@test.com',
        password: hashedPassword,
        phone: '+919876543222',
        role: 'vendor',
        isActive: true
      },
      { upsert: true, new: true }
    );

    console.log('✅ Created vendor users\n');

    // Create Restaurants
    const restaurant1 = await Restaurant.create({
      name: 'Pizza Palace',
      ownerId: vendor1._id,
      description: 'Authentic Italian pizzas with fresh ingredients',
      cuisines: ['Italian', 'Fast Food'],
      location: {
        street: '123 Main Street',
        city: 'Delhi',
        state: 'Delhi',
        zipCode: '110001',
        country: 'India',
        coordinates: {
          type: 'Point',
          coordinates: [77.2090, 28.6139] // [longitude, latitude]
        }
      },
      contactInfo: {
        phone: '+911234567890',
        email: 'contact@pizzapalace.com'
      },
      openingHours: [
        { day: 'Monday', open: '10:00', close: '23:00' },
        { day: 'Tuesday', open: '10:00', close: '23:00' },
        { day: 'Wednesday', open: '10:00', close: '23:00' },
        { day: 'Thursday', open: '10:00', close: '23:00' },
        { day: 'Friday', open: '10:00', close: '23:00' },
        { day: 'Saturday', open: '10:00', close: '23:00' },
        { day: 'Sunday', open: '10:00', close: '23:00' }
      ],
      deliveryTime: { min: 30, max: 45 },
      minimumOrder: 200,
      deliveryFee: 40,
      rating: { average: 4.5, count: 150 },
      isOpen: true,
      isActive: true,
      pricing: '$$'
    });

    const restaurant2 = await Restaurant.create({
      name: 'Burger Bistro',
      ownerId: vendor2._id,
      description: 'Juicy burgers and crispy fries',
      cuisines: ['Fast Food', 'American'],
      location: {
        street: '456 Park Avenue',
        city: 'Delhi',
        state: 'Delhi',
        zipCode: '110002',
        country: 'India',
        coordinates: {
          type: 'Point',
          coordinates: [77.2150, 28.6200]
        }
      },
      contactInfo: {
        phone: '+911234567891',
        email: 'contact@burgerbistro.com'
      },
      openingHours: [
        { day: 'Monday', open: '11:00', close: '22:00' },
        { day: 'Tuesday', open: '11:00', close: '22:00' },
        { day: 'Wednesday', open: '11:00', close: '22:00' },
        { day: 'Thursday', open: '11:00', close: '22:00' },
        { day: 'Friday', open: '11:00', close: '23:00' },
        { day: 'Saturday', open: '11:00', close: '23:00' },
        { day: 'Sunday', open: '11:00', close: '22:00' }
      ],
      deliveryTime: { min: 25, max: 40 },
      minimumOrder: 150,
      deliveryFee: 30,
      rating: { average: 4.3, count: 200 },
      isOpen: true,
      isActive: true,
      pricing: '$'
    });

    const restaurant3 = await Restaurant.create({
      name: 'Indian Spice',
      ownerId: vendor3._id,
      description: 'Traditional Indian cuisine with authentic flavors',
      cuisines: ['Indian', 'North Indian', 'South Indian'],
      location: {
        street: '789 Gandhi Road',
        city: 'Delhi',
        state: 'Delhi',
        zipCode: '110003',
        country: 'India',
        coordinates: {
          type: 'Point',
          coordinates: [77.2250, 28.6250]
        }
      },
      contactInfo: {
        phone: '+911234567892',
        email: 'contact@indianspice.com'
      },
      openingHours: [
        { day: 'Monday', open: '12:00', close: '23:00' },
        { day: 'Tuesday', open: '12:00', close: '23:00' },
        { day: 'Wednesday', open: '12:00', close: '23:00' },
        { day: 'Thursday', open: '12:00', close: '23:00' },
        { day: 'Friday', open: '12:00', close: '23:00' },
        { day: 'Saturday', open: '12:00', close: '23:00' },
        { day: 'Sunday', open: '12:00', close: '23:00' }
      ],
      deliveryTime: { min: 35, max: 50 },
      minimumOrder: 250,
      deliveryFee: 50,
      rating: { average: 4.7, count: 300 },
      isOpen: true,
      isActive: true,
      pricing: '$$'
    });

    console.log('✅ Created 3 restaurants\n');

    // Create Menu Items for Pizza Palace
    const pizzaItems = await MenuItem.insertMany([
      {
        restaurantId: restaurant1._id,
        name: 'Margherita Pizza',
        description: 'Classic pizza with tomato sauce, mozzarella, and basil',
        price: 299,
        category: 'Pizza',
        isVeg: true,
        isAvailable: true,
        preparationTime: 20
      },
      {
        restaurantId: restaurant1._id,
        name: 'Pepperoni Pizza',
        description: 'Spicy pepperoni with cheese and tomato sauce',
        price: 399,
        category: 'Pizza',
        isVeg: false,
        isAvailable: true,
        preparationTime: 20
      },
      {
        restaurantId: restaurant1._id,
        name: 'Veggie Supreme',
        description: 'Loaded with bell peppers, onions, mushrooms, and olives',
        price: 349,
        category: 'Pizza',
        isVeg: true,
        isAvailable: true,
        preparationTime: 25
      },
      {
        restaurantId: restaurant1._id,
        name: 'Garlic Bread',
        description: 'Crispy bread with garlic butter',
        price: 129,
        category: 'Sides',
        isVeg: true,
        isAvailable: true,
        preparationTime: 10
      },
      {
        restaurantId: restaurant1._id,
        name: 'Chocolate Lava Cake',
        description: 'Warm chocolate cake with molten center',
        price: 149,
        category: 'Desserts',
        isVeg: true,
        isAvailable: true,
        preparationTime: 15
      }
    ]);

    // Create Menu Items for Burger Bistro
    const burgerItems = await MenuItem.insertMany([
      {
        restaurantId: restaurant2._id,
        name: 'Classic Beef Burger',
        description: 'Juicy beef patty with lettuce, tomato, and special sauce',
        price: 249,
        category: 'Burgers',
        isVeg: false,
        isAvailable: true,
        preparationTime: 15
      },
      {
        restaurantId: restaurant2._id,
        name: 'Veggie Burger',
        description: 'Plant-based patty with fresh vegetables',
        price: 199,
        category: 'Burgers',
        isVeg: true,
        isAvailable: true,
        preparationTime: 15
      },
      {
        restaurantId: restaurant2._id,
        name: 'Chicken Burger',
        description: 'Grilled chicken with mayo and lettuce',
        price: 229,
        category: 'Burgers',
        isVeg: false,
        isAvailable: true,
        preparationTime: 15
      },
      {
        restaurantId: restaurant2._id,
        name: 'French Fries',
        description: 'Crispy golden fries',
        price: 99,
        category: 'Sides',
        isVeg: true,
        isAvailable: true,
        preparationTime: 10
      },
      {
        restaurantId: restaurant2._id,
        name: 'Chocolate Shake',
        description: 'Thick and creamy chocolate milkshake',
        price: 129,
        category: 'Beverages',
        isVeg: true,
        isAvailable: true,
        preparationTime: 5
      }
    ]);

    // Create Menu Items for Indian Spice
    const indianItems = await MenuItem.insertMany([
      {
        restaurantId: restaurant3._id,
        name: 'Butter Chicken',
        description: 'Tender chicken in rich tomato-based curry',
        price: 349,
        category: 'Main Course',
        isVeg: false,
        isAvailable: true,
        preparationTime: 25
      },
      {
        restaurantId: restaurant3._id,
        name: 'Paneer Tikka Masala',
        description: 'Grilled cottage cheese in creamy tomato gravy',
        price: 299,
        category: 'Main Course',
        isVeg: true,
        isAvailable: true,
        preparationTime: 20
      },
      {
        restaurantId: restaurant3._id,
        name: 'Dal Makhani',
        description: 'Creamy black lentils cooked overnight',
        price: 249,
        category: 'Main Course',
        isVeg: true,
        isAvailable: true,
        preparationTime: 15
      },
      {
        restaurantId: restaurant3._id,
        name: 'Garlic Naan',
        description: 'Soft flatbread with garlic and butter',
        price: 49,
        category: 'Breads',
        isVeg: true,
        isAvailable: true,
        preparationTime: 10
      },
      {
        restaurantId: restaurant3._id,
        name: 'Biryani',
        description: 'Aromatic rice with spices and meat',
        price: 399,
        category: 'Rice',
        isVeg: false,
        isAvailable: true,
        preparationTime: 30
      },
      {
        restaurantId: restaurant3._id,
        name: 'Masala Chai',
        description: 'Traditional Indian spiced tea',
        price: 39,
        category: 'Beverages',
        isVeg: true,
        isAvailable: true,
        preparationTime: 5
      }
    ]);

    console.log('✅ Created menu items for all restaurants\n');

    console.log('═══════════════════════════════════════════');
    console.log('🎉 DEMO DATA SEEDED SUCCESSFULLY!');
    console.log('═══════════════════════════════════════════\n');

    console.log('📊 Summary:');
    console.log('   ✅ 3 Restaurants created');
    console.log('   ✅ 16 Menu items created');
    console.log('   ✅ 3 Vendor accounts created\n');

    console.log('🏪 Restaurants:');
    console.log('   1. Pizza Palace (Italian, Fast Food)');
    console.log('   2. Burger Bistro (Fast Food, American)');
    console.log('   3. Indian Spice (Indian, North Indian)\n');

    console.log('👥 Vendor Accounts (can login to manage):');
    console.log('   • vendor1@test.com / password123 (Pizza Palace)');
    console.log('   • vendor2@test.com / password123 (Burger Bistro)');
    console.log('   • vendor3@test.com / password123 (Indian Spice)\n');

    console.log('🌐 Refresh your browser at http://localhost:5173');
    console.log('   You should now see 3 restaurants!\n');

    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB\n');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
