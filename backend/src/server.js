const http = require('http');
const app = require('./app');
const { connectDatabase } = require('./config/database');
const config = require('./config/env');
const { initializeSocket } = require('./sockets');

const PORT = config.port;

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
initializeSocket(server);

// Graceful shutdown
const gracefulShutdown = async (signal) => {
  console.log(`\n${signal} received. Starting graceful shutdown...`);

  server.close(async () => {
    console.log('HTTP server closed');

    try {
      const mongoose = require('mongoose');
      await mongoose.connection.close();
      console.log('MongoDB connection closed');
      process.exit(0);
    } catch (error) {
      console.error('Error during shutdown:', error);
      process.exit(1);
    }
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    console.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

// Handle process termination signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! 💥');
  console.error('Error:', err.name, err.message);
  console.error('Stack:', err.stack);

  if (config.env === 'production') {
    server.close(() => {
      process.exit(1);
    });
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! 💥');
  console.error('Error:', err.name, err.message);
  console.error('Stack:', err.stack);

  // In production, attempt graceful shutdown
  if (config.env === 'production') {
    gracefulShutdown('UNCAUGHT_EXCEPTION');
  } else {
    process.exit(1);
  }
});

// Start server
const startServer = async () => {
  try {
    // Connect to database
    await connectDatabase();
    console.log('✅ Database connected successfully');

    // Start HTTP server
    server.listen(PORT, () => {
      console.log('\n🚀 Server Information:');
      console.log(`   - Environment: ${config.env}`);
      console.log(`   - Port: ${PORT}`);
      console.log(`   - API URL: http://localhost:${PORT}/api`);
      console.log(`   - Health Check: http://localhost:${PORT}/health`);
      console.log('\n✨ Server is ready to accept requests!\n');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Start the application
startServer();

