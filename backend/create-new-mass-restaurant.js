const mongoose = require('mongoose');
const Restaurant = require('./src/models/Restaurant');
const User = require('./src/models/User');

async function createNewMassRestaurant() {
  try {
    await mongoose.connect('mongodb://localhost:27017/food-delivery');
    console.log('✅ Connected to database\n');

    // Find the demo vendor first
    const demoVendor = await User.findOne({ email: 'vendor@demo.com', role: 'vendor' });

    if (!demoVendor) {
      console.log('❌ vendor@demo.com not found');
      process.exit(1);
    }

    // Create New Mass Restaurant
    const newMass = new Restaurant({
      _id: new mongoose.Types.ObjectId('691432226033d14a068e0ecb'),
      name: 'New Mass',
      description: 'Authentic Madurai cuisine serving traditional mutton, chicken, and fish dishes with famous Madurai specialties like Kari Dosa, Jigarthanda, and more',
      ownerId: demoVendor._id,
      cuisines: ['South Indian', 'Chettinad', 'Madurai Special', 'Non-Veg'],
      location: {
        street: '123 West Masi Street',
        city: 'Madurai',
        state: 'Tamil Nadu',
        zipCode: '625001',
        country: 'India',
        coordinates: {
          type: 'Point',
          coordinates: [78.1198, 9.9252] // [longitude, latitude] - Madurai coordinates
        }
      },
      contactInfo: {
        phone: '+919876543216',
        email: 'contact@newmass.com'
      },
      rating: {
        average: 4.5,
        count: 150
      },
      pricing: '$$',
      openingHours: [
        { day: 'Monday', open: '11:00', close: '23:00' },
        { day: 'Tuesday', open: '11:00', close: '23:00' },
        { day: 'Wednesday', open: '11:00', close: '23:00' },
        { day: 'Thursday', open: '11:00', close: '23:00' },
        { day: 'Friday', open: '11:00', close: '23:00' },
        { day: 'Saturday', open: '11:00', close: '23:00' },
        { day: 'Sunday', open: '11:00', close: '23:00' }
      ],
      isActive: true,
      isOpen: true,
      isApproved: true,
      deliveryTime: {
        min: 30,
        max: 45
      },
      minimumOrder: 150,
      deliveryFee: 30,
      tags: ['Madurai Cuisine', 'Mutton Specials', 'Biryani', 'Chettinad', 'Non-Veg', 'Signature Dishes', 'Jigarthanda'],
      images: [
        {
          url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200',
          isPrimary: true
        },
        {
          url: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800',
          isPrimary: false
        },
        {
          url: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800',
          isPrimary: false
        }
      ]
    });

    await newMass.save();
    console.log('✅ Created New Mass Restaurant');
    console.log(`   ID: ${newMass._id}`);
    console.log(`   Name: ${newMass.name}`);
    console.log(`   Address: ${newMass.location.street}, ${newMass.location.city}`);
    console.log(`   Cuisines: ${newMass.cuisines.join(', ')}`);
    console.log(`   Owner: ${demoVendor.name} (${demoVendor.email})`);

    // Link vendor to this restaurant
    demoVendor.restaurantId = newMass._id;
    await demoVendor.save();

    console.log(`\n✅ Linked vendor@demo.com to New Mass Restaurant`);
    console.log('\n✅ New Mass Restaurant setup complete!');
    console.log('\nNext steps:');
    console.log('   1. Run: node add-madurai-menu.js (to add menu items)');
    console.log('   2. Login as vendor@demo.com to manage the restaurant');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createNewMassRestaurant();
