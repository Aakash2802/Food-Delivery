const mongoose = require('mongoose');
const Order = require('./src/models/Order');
const Restaurant = require('./src/models/Restaurant');
const { calculateDistance } = require('./src/utils/helpers');

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/food-delivery', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const updateDeliveredOrdersDistance = async () => {
  try {
    await connectDB();

    // Find all delivered orders without distance or with distance = 0
    const deliveredOrders = await Order.find({
      status: 'delivered',
      $or: [
        { distance: { $exists: false } },
        { distance: 0 }
      ]
    }).populate('restaurantId');

    console.log(`\n📦 Found ${deliveredOrders.length} delivered orders without distance\n`);

    let updated = 0;
    let skipped = 0;

    for (const order of deliveredOrders) {
      const restaurant = order.restaurantId;

      if (!restaurant) {
        console.log(`⚠️  Order ${order.orderNumber}: Restaurant not found, skipping`);
        skipped++;
        continue;
      }

      // Check if both locations exist
      const hasRestLocation = restaurant.address?.location?.coordinates?.length === 2;
      const hasDeliveryLocation = order.deliveryAddress?.location?.coordinates?.length === 2;

      if (!hasRestLocation || !hasDeliveryLocation) {
        console.log(`⚠️  Order ${order.orderNumber}: Missing location data, skipping`);
        skipped++;
        continue;
      }

      // Calculate distance
      const [restLng, restLat] = restaurant.address.location.coordinates;
      const [custLng, custLat] = order.deliveryAddress.location.coordinates;
      const distance = calculateDistance(restLat, restLng, custLat, custLng);

      // Update order
      order.distance = distance;
      await order.save();

      console.log(`✅ Order ${order.orderNumber}: Updated distance to ${distance.toFixed(2)} km`);
      updated++;
    }

    console.log(`\n📊 Summary:`);
    console.log(`   ✅ Updated: ${updated} orders`);
    console.log(`   ⚠️  Skipped: ${skipped} orders`);
    console.log(`\n✨ Distance update complete!\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating distances:', error);
    process.exit(1);
  }
};

updateDeliveredOrdersDistance();
