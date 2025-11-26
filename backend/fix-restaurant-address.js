const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/food-delivery')
  .then(async () => {
    const db = mongoose.connection.db;

    // Update New Mass restaurant with proper address
    const result = await db.collection('restaurants').updateOne(
      { name: 'New Mass' },
      {
        $set: {
          address: {
            street: 'Undefined Networks, Branch & ATM, 7th St, Gandhipuram',
            city: 'Coimbatore',
            state: 'Tamil Nadu',
            zipCode: '641012',
            location: {
              type: 'Point',
              coordinates: [77.0091, 11.0168] // Gandhipuram, Coimbatore coordinates
            }
          },
          contactNumber: '+919876543210'
        }
      }
    );

    console.log('✅ Updated New Mass restaurant address');
    console.log('Modified:', result.modifiedCount);

    const updated = await db.collection('restaurants').findOne(
      { name: 'New Mass' },
      { projection: { name: 1, address: 1, contactNumber: 1 } }
    );

    console.log('\nUpdated Restaurant:');
    console.log(JSON.stringify(updated, null, 2));

    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
