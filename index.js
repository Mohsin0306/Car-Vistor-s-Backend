const express = require('express');
const connectDB = require('./config/db');
const dotenv = require('dotenv');
const cors = require('cors');
const authRoutes = require('./routes/Auth');
const freeVinRoutes = require('./routes/Free_VIN_Decode');
const requestRoutes = require('./routes/Request');
const userRoutes = require('./routes/User');
const reportRoutes = require('./routes/Report');
const notificationRoutes = require('./routes/Notification');
dotenv.config();
const app = express();

// CORS configuration - allow all origins for Railway deployment
app.use(cors({
  origin: '*', // Allow all origins
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: false, // Set to false when using origin: '*'
  optionsSuccessStatus: 200
}));
app.use(express.json());

// Health check endpoint for Railway
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/vin', freeVinRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/notifications', notificationRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  console.error('Error stack:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Server error occurred',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Use PORT from environment variable (Railway provides this) or default to 3000
// Ensure PORT is a valid integer
const port = parseInt(process.env.PORT, 10) || 3000;

// Validate port number
if (isNaN(port) || port < 0 || port > 65535) {
  console.error('Invalid PORT value. Using default port 3000');
  const defaultPort = 3000;
  app.listen(defaultPort, '0.0.0.0', () => {
    console.log(`Server is running on port ${defaultPort}`);
    connectDB();
  });
} else {
app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on port ${port}`);
  connectDB();
});
}