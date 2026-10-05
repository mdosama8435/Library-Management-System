const mongoose = require('mongoose');

let mongoMemoryServer = null;

/**
 * Connect to MongoDB.
 * Connects to MONGODB_URI if available; gracefully falls back to an embedded
 * MongoMemoryServer if no local MongoDB daemon is running, guaranteeing 100%
 * zero-setup reliability for development, evaluation, and automated testing.
 */
const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/shelflife';

  // If memory DB is explicitly requested or in test mode without an external URI
  if (process.env.USE_MEMORY_DB === 'true') {
    return await connectMemoryDB();
  }

  try {
    // Attempt standard connection with 2.5s timeout
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2500,
    });
    console.log(`[Database] MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (primaryError) {
    console.warn(`[Database] Could not connect to primary MongoDB at ${uri}.`);
    console.log('[Database] Initiating embedded MongoMemoryServer fallback for local/test run...');
    return await connectMemoryDB();
  }
};

/**
 * Embedded in-memory MongoDB connection for isolated zero-setup environments
 */
const connectMemoryDB = async () => {
  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    mongoMemoryServer = await MongoMemoryServer.create();
    const memoryUri = mongoMemoryServer.getUri();

    const conn = await mongoose.connect(memoryUri);
    console.log(`[Database] Embedded MongoDB connected at: ${memoryUri}`);
    return conn;
  } catch (error) {
    console.error('[Database] Failed to connect to embedded MongoDB:', error.message);
    throw error;
  }
};

/**
 * Disconnect from MongoDB and stop memory server if running
 */
const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongoMemoryServer) {
      await mongoMemoryServer.stop();
      mongoMemoryServer = null;
    }
    console.log('[Database] MongoDB disconnected cleanly.');
  } catch (error) {
    console.error('[Database] Error while disconnecting:', error.message);
  }
};

module.exports = {
  connectDB,
  disconnectDB,
};
