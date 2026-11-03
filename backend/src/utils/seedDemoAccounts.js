/**
 * Create (or reset) the demo accounts shown on the login page, plus an
 * approved demo restaurant with a small menu for the demo vendor.
 * Safe to re-run: existing records are updated, not duplicated.
 *
 * Usage: npm run seed   (or: node src/utils/seedDemoAccounts.js)
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const MenuItem = require('../models/MenuItem');

const PASSWORD = 'password123';

const DEMO_USERS = [
  { name: 'Demo Customer', email: 'customer@demo.com', phone: '+919000000001', role: 'customer' },
  { name: 'Demo Vendor', email: 'vendor@demo.com', phone: '+919000000002', role: 'vendor' },
  {
    name: 'Demo Driver', email: 'driver@demo.com', phone: '+919000000003', role: 'driver',
    vehicleDetails: { type: 'bike', number: 'TN 58 AB 1234', model: 'Honda Activa' },
    isAvailable: true
  }
];

const DEMO_RESTAURANT = {
  name: 'Demo Kitchen',
  description: 'Demo restaurant for trying out the app. South Indian & North Indian favourites.',
  cuisines: ['South Indian', 'North Indian'],
  location: {
    street: '12 Anna Nagar Main Road',
    city: 'Madurai',
    state: 'Tamil Nadu',
    zipCode: '625020',
    country: 'India',
    coordinates: { type: 'Point', coordinates: [78.1198, 9.9252] }
  },
  contactInfo: { phone: '+919000000002', email: 'vendor@demo.com' },
  deliveryTime: { min: 25, max: 40 },
  deliveryFee: 30,
  minimumOrder: 100,
  isApproved: true,
  status: 'active',
  approvedAt: new Date(),
  isActive: true,
  isOpen: true
};

const DEMO_MENU = [
  { name: 'Masala Dosa', category: 'Breakfast', price: 90, description: 'Crisp dosa with potato masala, sambar and chutney' },
  { name: 'Chicken Biryani', category: 'Main Course', price: 180, description: 'Dum-cooked biryani with raita' },
  { name: 'Paneer Butter Masala', category: 'Main Course', price: 160, description: 'Paneer in a rich tomato-butter gravy' },
  { name: 'Filter Coffee', category: 'Beverages', price: 40, description: 'Strong South Indian filter coffee' }
];

const upsertUser = async (data) => {
  let user = await User.findOne({ email: data.email }).select('+password');
  if (user) {
    Object.assign(user, data, { password: PASSWORD, isActive: true });
    await user.save(); // pre-save hook re-hashes the password
    console.log(`✅ Reset ${data.role}: ${data.email}`);
  } else {
    user = await User.create({ ...data, password: PASSWORD });
    console.log(`✅ Created ${data.role}: ${data.email}`);
  }
  return user;
};

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const users = {};
  for (const data of DEMO_USERS) {
    users[data.role] = await upsertUser(data);
  }

  // find + save (not findOneAndUpdate) so the schema's document validators run with `this`
  let restaurant = await Restaurant.findOne({ ownerId: users.vendor._id });
  if (restaurant) {
    Object.assign(restaurant, DEMO_RESTAURANT);
  } else {
    restaurant = new Restaurant({ ...DEMO_RESTAURANT, ownerId: users.vendor._id });
  }
  await restaurant.save();
  await User.updateOne({ _id: users.vendor._id }, { restaurantId: restaurant._id });
  console.log(`✅ Restaurant ready: ${restaurant.name}`);

  for (const item of DEMO_MENU) {
    let menuItem = await MenuItem.findOne({ restaurantId: restaurant._id, name: item.name });
    if (menuItem) {
      Object.assign(menuItem, item, { isAvailable: true });
    } else {
      menuItem = new MenuItem({ ...item, restaurantId: restaurant._id, isAvailable: true });
    }
    await menuItem.save();
  }
  console.log(`✅ Menu ready: ${DEMO_MENU.length} items`);

  console.log(`\nAll demo accounts use password: ${PASSWORD}`);
};

run()
  .catch((err) => {
    console.error('❌ Seed failed:', err.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
