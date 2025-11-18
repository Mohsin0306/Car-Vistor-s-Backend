const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // Support both MONGO_URI and MONGODB_URI (Railway uses MONGODB_URI)
        const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
        
        if (!mongoUri) {
            console.error('MongoDB URI not found in environment variables');
            throw new Error('MongoDB URI not found in environment variables');
        }
        
        // Connection options for better reliability
        const options = {
            serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
            socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
            maxPoolSize: 10, // Maintain up to 10 socket connections
            minPoolSize: 1, // Maintain at least 1 socket connection
        };

        await mongoose.connect(mongoUri, options);
        console.log('MongoDB connected successfully');
        
        // Handle connection events
        mongoose.connection.on('error', (err) => {
            console.error('MongoDB connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.warn('MongoDB disconnected. Attempting to reconnect...');
        });

        mongoose.connection.on('reconnected', () => {
            console.log('MongoDB reconnected successfully');
        });

    } catch (error) {
        console.error('MongoDB connection error:', error);
        console.error('Error details:', {
            name: error.name,
            message: error.message,
            stack: error.stack
        });
        // Don't exit process immediately, allow server to start and retry
        // The connection check in controllers will handle this gracefully
        console.warn('Server will continue but database operations may fail. Please check MongoDB connection.');
    }
};

module.exports = connectDB;