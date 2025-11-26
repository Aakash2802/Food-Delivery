const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./src/models/User');
const bcrypt = require('bcryptjs');

const createDemoAccounts = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    const password = 'password123';

    const demoAccounts = [
      {
        email: 'customer@demo.com',
        password: password, // Plain password - model will hash it
        name: 'Demo Customer',
        role: 'customer',
        phone: '+919876543210',
        isVerified: true
      },
      {
        email: 'vendor@demo.com',
        password: password, // Plain password - model will hash it
        name: 'Demo Vendor',
        role: 'vendor',
        phone: '+919876543211',
        isVerified: true
      },
      {
        email: 'driver@demo.com',
        password: password, // Plain password - model will hash it
        name: 'Demo Driver',
        role: 'driver',
        phone: '+919876543212',
        isVerified: true,
        vehicleDetails: {
          type: 'bike',
          number: 'TN99AB1234',
          model: 'Honda Activa'
        },
        licenseNumber: 'TN0112345678',
        isAvailable: true
      },
      {
        email: 'admin@demo.com',
        password: password, // Plain password - model will hash it
        name: 'Demo Admin',
        role: 'admin',
        phone: '+919876543299',
        isVerified: true
      }
    ];

    console.log('Creating demo accounts...\n');

    for (const accountData of demoAccounts) {
      // Check if user already exists
      const existingUser = await User.findOne({ email: accountData.email });

      if (existingUser) {
        console.log(`⚠️  User already exists: ${accountData.email}`);
        // Delete and recreate to ensure clean state
        await User.deleteOne({ email: accountData.email });
        const user = await User.create(accountData); // Create will trigger pre-save hook to hash password
        console.log(`✅ Recreated: ${user.email}`);
      } else {
        const user = await User.create(accountData); // Create will trigger pre-save hook to hash password
        console.log(`✅ Created: ${user.email} (${user.role})`);
      }
    }

    console.log('\n=== DEMO ACCOUNTS CREATED ===\n');
    console.log('Customer: customer@demo.com / password123');
    console.log('Vendor:   vendor@demo.com / password123');
    console.log('Driver:   driver@demo.com / password123');
    console.log('Admin:    admin@demo.com / password123\n');

    await mongoose.disconnect();
    console.log('✅ Done!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
};

createDemoAccounts();
