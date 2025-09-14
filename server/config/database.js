const mongoose = require('mongoose');

class DatabaseConnection {
  constructor() {
    this.isConnected = false;
  }

  async connect() {
    if (this.isConnected) {
      console.log('✅ Already connected to MongoDB');
      return;
    }

    try {
      const options = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        bufferMaxEntries: 0,
        bufferCommands: false,
      };

      await mongoose.connect(process.env.MONGODB_URI, options);
      
      this.isConnected = true;
      console.log('✅ Connected to MongoDB successfully');
      
      // Handle connection events
      mongoose.connection.on('error', (err) => {
        console.error('❌ MongoDB connection error:', err);
        this.isConnected = false;
      });

      mongoose.connection.on('disconnected', () => {
        console.log('⚠️ MongoDB disconnected');
        this.isConnected = false;
      });

      mongoose.connection.on('reconnected', () => {
        console.log('✅ MongoDB reconnected');
        this.isConnected = true;
      });

    } catch (error) {
      console.error('❌ MongoDB connection failed:', error);
      this.isConnected = false;
      throw error;
    }
  }

  async disconnect() {
    if (!this.isConnected) {
      return;
    }

    try {
      await mongoose.disconnect();
      this.isConnected = false;
      console.log('✅ Disconnected from MongoDB');
    } catch (error) {
      console.error('❌ Error disconnecting from MongoDB:', error);
      throw error;
    }
  }

  getConnection() {
    return mongoose.connection;
  }

  isHealthy() {
    return this.isConnected && mongoose.connection.readyState === 1;
  }
}

module.exports = new DatabaseConnection();