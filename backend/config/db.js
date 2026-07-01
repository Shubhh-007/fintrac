const mongoose = require('mongoose');

const connectDB = async () => {
  let mongoUri = process.env.MONGODB_URI;

  try {
    console.log('Connecting to primary MongoDB...');
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 3000,
      connectTimeoutMS: 3000,
      socketTimeoutMS: 3000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Primary database connection failed: ${error.message}`);
    
    // Fallback to local MongoDB
    const fallbackUri = 'mongodb://127.0.0.1:27017/expense_tracker';
    console.log(`Attempting fallback database connection to ${fallbackUri}...`);
    try {
      const conn = await mongoose.connect(fallbackUri, {
        serverSelectionTimeoutMS: 2000,
        connectTimeoutMS: 2000,
      });
      console.log(`MongoDB Connected (Fallback): ${conn.connection.host}`);
    } catch (fallbackError) {
      console.error(`Fallback database connection failed: ${fallbackError.message}`);
      console.warn('⚠️ Server will run without a database connection. Database features will be unavailable.');
      // Do NOT exit process, so server remains online for UI inspection
    }
  }
};

module.exports = connectDB;
