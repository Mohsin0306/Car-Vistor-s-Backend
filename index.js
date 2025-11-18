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
const contactRoutes = require('./routes/Contact');
dotenv.config();
const app = express();

// CORS configuration - allow specific origins
const allowedOrigins = [
  'https://carvistors.vercel.app',
  'http://192.168.100.72:5173',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowed list
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      // For development, allow all origins
      if (process.env.NODE_ENV !== 'production') {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true, // Allow credentials
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
app.use('/api/contact', contactRoutes);

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