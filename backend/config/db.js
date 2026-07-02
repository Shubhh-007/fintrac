const mongoose = require('mongoose');

const connectDB = async () => {
  let mongoUri = process.env.MONGODB_URI;

  try {
    console.log('Connecting to primary MongoDB...');
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      family: 4  // Use IPv4, skip IPv6
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Migration: Mark existing users as verified
    try {
      const User = require('../models/User');
      const result = await User.updateMany(
        { isVerified: { $exists: false } },
        { $set: { isVerified: true } }
      );
      if (result.modifiedCount > 0) {
        console.log(`Migrated ${result.modifiedCount} existing users to isVerified: true`);
      }
    } catch (migErr) {
      console.error('Failed to run user verification migration:', migErr.message);
    }
  } catch (error) {
    console.error(`Primary database connection failed: ${error.message}`);
    
    // Fallback to local MongoDB
    const fallbackUri = 'mongodb://127.0.0.1:27017/expense_tracker';
    console.log(`Attempting fallback database connection to ${fallbackUri}...`);
    try {
      const conn = await mongoose.connect(fallbackUri, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log(`MongoDB Connected (Fallback): ${conn.connection.host}`);
      
      // Fallback migration
      try {
        const User = require('../models/User');
        await User.updateMany(
          { isVerified: { $exists: false } },
          { $set: { isVerified: true } }
        );
      } catch (migErr) {
        console.error('Failed to run fallback user verification migration:', migErr.message);
      }
    } catch (fallbackError) {
      console.error(`Fallback database connection failed: ${fallbackError.message}`);
      console.warn('⚠️ Server will run without a database connection. Database features will be unavailable.');
    }
  }
};

module.exports = connectDB;
