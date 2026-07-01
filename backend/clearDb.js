const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

const clearDatabase = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/expense_tracker';
  console.log(`Connecting to MongoDB at: ${uri}`);
  
  try {
    await mongoose.connect(uri);
    console.log('Successfully connected to database.');

    const collections = Object.keys(mongoose.connection.collections);
    for (const name of collections) {
      await mongoose.connection.collections[name].deleteMany({});
      console.log(`🧹 Cleared all documents from collection: "${name}"`);
    }

    console.log('🎉 Database reset complete.');
  } catch (error) {
    console.error('❌ Failed to clear database:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

clearDatabase();
