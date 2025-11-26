const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/food-delivery')
  .then(async () => {
    const db = mongoose.connection.db;

    // Update the completed order with distance
    const result = await db.collection('orders').updateOne(
      { orderNumber: 'ORD09480392445' },
      {
        $set: {
          'deliveryAddress.location.coordinates': [78.1500, 9.9500],
          distance: 3.2
        }
      }
    );

    console.log('✅ Updated order with distance: 3.2 km');
    console.log('Modified:', result.modifiedCount);

    const order = await db.collection('orders').findOne(
      { orderNumber: 'ORD09480392445' },
      { projection: { distance: 1, deliveryAddress: 1 } }
    );

    console.log('\nOrder distance:', order.distance, 'km');

    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
