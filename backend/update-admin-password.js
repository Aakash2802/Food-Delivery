const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function updateAdminPassword() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const hashedPassword = await bcrypt.hash('aakash1234', 10);

    const result = await mongoose.connection.db.collection('users').updateOne(
      { email: 'aakash@gmail.com' },
      { $set: { password: hashedPassword } }
    );

    console.log('Updated:', result.modifiedCount, 'document(s)');
    console.log('\nAdmin credentials:');
    console.log('Email: aakash@gmail.com');
    console.log('Password: aakash1234');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

updateAdminPassword();
