const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User');

async function updateAdminCredentials() {
  try {
    await mongoose.connect('mongodb://localhost:27017/food-delivery');
    console.log('✅ Connected to database\n');

    // Hash the new password
    const hashedPassword = await bcrypt.hash('aakash1234', 10);

    // Update admin credentials
    const result = await User.updateOne(
      { role: 'admin' },
      {
        $set: {
          email: 'aakash@gmail.com',
          password: hashedPassword,
          name: 'Aakash'
        }
      }
    );

    console.log('✅ Admin credentials updated successfully');
    console.log(`   Email: aakash@gmail.com`);
    console.log(`   Password: aakash1234`);
    console.log(`\n✅ Modified ${result.modifiedCount} document(s)`);

    // Verify the change
    const admin = await User.findOne({ role: 'admin' }).select('name email role');
    if (admin) {
      console.log('\n📋 Verification:');
      console.log(`   Name: ${admin.name}`);
      console.log(`   Email: ${admin.email}`);
      console.log(`   Role: ${admin.role}`);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

updateAdminCredentials();
