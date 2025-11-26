require('./src/config/env');
const mongoose = require('mongoose');
const Order = require('./src/models/Order');
const Restaurant = require('./src/models/Restaurant');

// Haversine formula to calculate distance between two coordinates
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 10) / 10; // Round to 1 decimal place
};

const updateOrderDistances = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/food-delivery');
    console.log('✅ Connected to MongoDB');

    // Find all delivered orders with distance = 0 or null
    const orders = await Order.find({
      status: 'delivered',
      $or: [{ distance: 0 }, { distance: null }, { distance: { $exists: false } }]
    }).populate('restaurantId');

    console.log(`📦 Found ${orders.length} orders to update`);

    let updated = 0;
    let skipped = 0;

    for (const order of orders) {
      try {
        // Get restaurant coordinates
        const restaurant = order.restaurantId;

        // Check for coordinates in both possible locations
        let restCoords = restaurant?.address?.location?.coordinates || restaurant?.location?.coordinates?.coordinates;

        if (!restCoords) {
          console.log(`⚠️  Order ${order.orderNumber}: No restaurant coordinates`);
          skipped++;
          continue;
        }

        if (!order.deliveryAddress?.location?.coordinates) {
          console.log(`⚠️  Order ${order.orderNumber}: No delivery address coordinates`);
          skipped++;
          continue;
        }

        const [restLng, restLat] = restCoords;
        const [custLng, custLat] = order.deliveryAddress.location.coordinates;

        // Calculate distance
        const distance = calculateDistance(restLat, restLng, custLat, custLng);

        // Update order
        order.distance = distance;
        await order.save();

        console.log(`✅ Order ${order.orderNumber}: ${distance} km (${restaurant.name} → ${order.deliveryAddress.city})`);
        updated++;
      } catch (error) {
        console.error(`❌ Error updating order ${order.orderNumber}:`, error.message);
        skipped++;
      }
    }

    console.log('\n📊 Summary:');
    console.log(`   Updated: ${updated} orders`);
    console.log(`   Skipped: ${skipped} orders`);
    console.log(`   Total:   ${orders.length} orders`);

    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

updateOrderDistances();
