const User = require('../Models/User');
const Admin = require('../Models/Admin');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendNotification, notifyAdmins } = require('../utils/notificationHelper');

// Register User
const registerUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // Validate input
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'All fields are required' 
      });
    }

    // Check MongoDB connection
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) {
      console.error('MongoDB not connected. Connection state:', mongoose.connection.readyState);
      return res.status(503).json({
        success: false,
        message: 'Database connection not available. Please try again later.'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        message: 'User already exists' 
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword
    });

    await user.save();

    try {
      await sendNotification({
        recipientType: 'user',
        recipientId: user._id,
        title: 'Welcome to Car Vistors',
        message: 'Your account has been created successfully. Start decoding VINs anytime.',
        type: 'success',
        link: '/dashboard',
      });

      await notifyAdmins({
        title: 'New User Registered',
        message: `${firstName || 'New'} ${lastName || 'User'} (${email}) just created an account.`,
        type: 'info',
        link: '/admin/users',
        metadata: { email },
      });
    } catch (notificationError) {
      console.error('Register notification error:', notificationError);
    }

    // Check JWT_SECRET - use fallback for development
    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    if (!jwtSecret || jwtSecret === 'your-secret-key-change-in-production') {
      console.warn('JWT_SECRET using default value. Please set JWT_SECRET in environment variables for production.');
    }

    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    const token = jwt.sign(
      { userId: user._id },
      jwtSecret,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      success: false,
      message: 'Server error occurred during registration',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Register Admin
const registerAdmin = async (req, res) => {
  try {
    const { firstName, lastName, email, password, role = 'admin' } = req.body;

    // Validate input
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'All fields are required' 
      });
    }

    // Check MongoDB connection
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) {
      console.error('MongoDB not connected. Connection state:', mongoose.connection.readyState);
      return res.status(503).json({
        success: false,
        message: 'Database connection not available. Please try again later.'
      });
    }

    // Check if any admin already exists (only allow one admin)
    const adminCount = await Admin.countDocuments();
    if (adminCount > 0) {
      return res.status(400).json({ 
        success: false,
        message: 'Admin registration is not allowed. Only one admin can exist.' 
      });
    }

    // Check if admin already exists with this email
    const existingAdmin = await Admin.findOne({ email: email.toLowerCase().trim() });
    if (existingAdmin) {
      return res.status(400).json({ 
        success: false,
        message: 'Admin already exists' 
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create admin
    const admin = new Admin({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role
    });

    await admin.save();

    // Check JWT_SECRET - use fallback for development
    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    if (!jwtSecret || jwtSecret === 'your-secret-key-change-in-production') {
      console.warn('JWT_SECRET using default value. Please set JWT_SECRET in environment variables for production.');
    }

    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    const token = jwt.sign(
      { adminId: admin._id, role: admin.role },
      jwtSecret,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Admin registered successfully',
      token,
      admin: {
        id: admin._id,
        firstName: admin.firstName,
        lastName: admin.lastName,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    console.error('Admin registration error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      success: false,
      message: 'Server error occurred during admin registration',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Login User/Admin
const loginUser = async (req, res) => {
  try {
    const { email, password, userType = 'user' } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Email and password are required' 
      });
    }

    // Check MongoDB connection
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) {
      console.error('MongoDB not connected. Connection state:', mongoose.connection.readyState);
      return res.status(503).json({
        success: false,
        message: 'Database connection not available. Please try again later.'
      });
    }

    // Check JWT_SECRET - use fallback for development
    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    if (!jwtSecret || jwtSecret === 'your-secret-key-change-in-production') {
      console.warn('JWT_SECRET using default value. Please set JWT_SECRET in environment variables for production.');
    }

    let user, isAdmin = false;

    try {
      if (userType === 'admin') {
        // Find admin
        user = await Admin.findOne({ email: email.toLowerCase().trim() });
        isAdmin = true;
      } else {
        // Find regular user
        user = await User.findOne({ email: email.toLowerCase().trim() });
      }
    } catch (dbError) {
      console.error('Database query error during login:', dbError);
      throw dbError;
    }

    if (!user) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    // Check password
    let isMatch = false;
    try {
      isMatch = await bcrypt.compare(password, user.password);
    } catch (bcryptError) {
      console.error('Password comparison error:', bcryptError);
      throw bcryptError;
    }

    if (!isMatch) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    // Generate JWT token with appropriate payload
    const tokenPayload = isAdmin 
      ? { adminId: user._id, role: user.role, userType: 'admin' }
      : { userId: user._id, userType: 'user' };

    let token;
    try {
      const jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
      token = jwt.sign(
        tokenPayload,
        jwtSecret,
        { expiresIn: '7d' }
      );
    } catch (jwtError) {
      console.error('JWT signing error:', jwtError);
      throw jwtError;
    }

    const responseData = {
      success: true,
      message: 'Login successful',
      token,
      userType: isAdmin ? 'admin' : 'user'
    };

    if (isAdmin) {
      responseData.admin = {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      };
    } else {
      responseData.user = {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      };
    }

    res.json(responseData);
  } catch (error) {
    console.error('Login error:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      success: false,
      message: 'Server error occurred during login',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  registerUser,
  registerAdmin,
  loginUser
};
