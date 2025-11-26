const mongoose = require('mongoose');
const Order = require('./src/models/Order');

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

const setDemoDistances = async () => {
  try {
    await connectDB();

    // Update all delivered orders with distance = 0 to have an estimated distance
    // Using random distances between 5-12 km for variety
    const deliveredOrders = await Order.find({
      status: 'delivered',
      distance: 0
    });

    console.log(`\n📦 Found ${deliveredOrders.length} delivered orders with 0 distance\n`);

    for (const order of deliveredOrders) {
      // Random distance between 5-12 km for realism
      const estimatedDistance = (Math.random() * (12 - 5) + 5).toFixed(2);
      order.distance = parseFloat(estimatedDistance);
      await order.save();
      console.log(`✅ Order ${order.orderNumber}: Set distance to ${estimatedDistance} km`);
    }

    console.log(`\n✨ Updated ${deliveredOrders.length} orders with estimated distances!\n`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

setDemoDistances();
