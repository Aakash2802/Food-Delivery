const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/food-delivery')
  .then(async () => {
    const db = mongoose.connection.db;

    // Update New Mass restaurant to Madurai location
    // Using SS Colony, Madurai as a central restaurant location
    const result = await db.collection('restaurants').updateOne(
      { name: 'New Mass' },
      {
        $set: {
          'address.street': '7th St, SS Colony',
          'address.city': 'Madurai',
          'address.state': 'Tamil Nadu',
          'address.zipCode': '625016',
          'address.location': {
            type: 'Point',
            coordinates: [78.1198, 9.9252]
          }
        }
      }
    );

    console.log('✅ Updated New Mass restaurant to Madurai location');
    console.log('Modified:', result.modifiedCount);

    const updated = await db.collection('restaurants').findOne(
      { name: 'New Mass' },
      { projection: { name: 1, address: 1 } }
    );

    console.log('\nUpdated Restaurant:');
    console.log(JSON.stringify(updated, null, 2));

    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
