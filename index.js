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
const port = 3000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/vin', freeVinRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/notifications', notificationRoutes);

app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on http://192.168.100.72:${port}`);
  console.log(`Server is also accessible on http://localhost:${port}`);
  connectDB();
});