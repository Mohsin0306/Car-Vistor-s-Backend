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
  origin: '*', // In production, replace with your frontend URL
  credentials: true
}));
app.use(express.json());

// Health check endpoint for Railway
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/vin', freeVinRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/notifications', notificationRoutes);

// Use PORT from environment variable (Railway provides this) or default to 3000
const port = process.env.PORT || 3000;

app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on port ${port}`);
  connectDB();
});