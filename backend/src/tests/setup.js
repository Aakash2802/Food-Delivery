/**
 * Test Setup
 * Configure test environment for Jest
 */

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

// Setup: Connect to in-memory MongoDB
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create({
    instance: {
      dbName: 'food-delivery-test'
    },
    binary: {
      downloadDir: './mongodb-binaries',
      version: '6.0.0'
    }
  });
  const mongoUri = mongoServer.getUri();

  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  // Ensure indexes are created for all models
  const Restaurant = require('../models/Restaurant');
  await Restaurant.createIndexes();

  console.log('✅ Test database connected');
});

// Cleanup: Clear database between tests
afterEach(async () => {
  const collections = mongoose.connection.collections;

  for (const key in collections) {
    await collections[key].deleteMany();
  }
});

// Teardown: Disconnect and stop MongoDB
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
  console.log('✅ Test database disconnected');
});

// Global test timeout
jest.setTimeout(60000);
