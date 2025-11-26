const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/food-delivery')
  .then(async () => {
    const db = mongoose.connection.db;

    // Update delivery address coordinates to Madurai
    await db.collection('orders').updateOne(
      { orderNumber: 'ORD09480392445' },
      { $set: { 'deliveryAddress.location.coordinates': [78.1198, 9.9252] } }
    );

    console.log('✅ Updated delivery address coordinates to Madurai (Othakadai)');

    const updated = await db.collection('orders').findOne(
      { orderNumber: 'ORD09480392445' },
      { projection: { deliveryAddress: 1 } }
    );

    console.log('\nUpdated Delivery Address:');
    console.log(JSON.stringify(updated.deliveryAddress, null, 2));

    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
