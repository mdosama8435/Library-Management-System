require('dotenv').config();
const app = require('./app');
const { connectDB, disconnectDB } = require('./config/db');
const { seedIfEmpty } = require('./scripts/seed');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // 1. Establish database connection
    await connectDB();

    // 2. Ensure initial seed data exists if database is clean
    await seedIfEmpty();

    // 2. Start HTTP server
    const server = app.listen(PORT, () => {
      console.log(`===============================================`);
      console.log(` ShelfLife Backend API is running on port ${PORT}`);
      console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(` Health check: http://localhost:${PORT}/health`);
      console.log(`===============================================`);
    });

    // Graceful shutdown handling
    const shutdown = async (signal) => {
      console.log(`\n[Server] Received ${signal}. Gracefully shutting down...`);
      server.close(async () => {
        console.log('[Server] HTTP server closed.');
        await disconnectDB();
        process.exit(0);
      });
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (error) {
    console.error('[Server] Critical failure during startup:', error);
    process.exit(1);
  }
};

startServer();
