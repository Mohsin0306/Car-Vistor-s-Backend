const User = require('../Models/User');
const Admin = require('../Models/Admin');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendNotification, notifyAdmins } = require('../utils/notificationHelper');

// Register User
const registerUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
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

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.status(201).json({
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

    // Check if any admin already exists (only allow one admin)
    const adminCount = await Admin.countDocuments();
    if (adminCount > 0) {
      return res.status(400).json({ message: 'Admin registration is not allowed. Only one admin can exist.' });
    }

    // Check if admin already exists with this email
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Admin already exists' });
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

    // Generate JWT token
    const token = jwt.sign(
      { adminId: admin._id, role: admin.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.status(201).json({
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

    let user, isAdmin = false;

    if (userType === 'admin') {
      // Find admin
      user = await Admin.findOne({ email });
      isAdmin = true;
    } else {
      // Find regular user
      user = await User.findOne({ email });
    }

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token with appropriate payload
    const tokenPayload = isAdmin 
      ? { adminId: user._id, role: user.role, userType: 'admin' }
      : { userId: user._id, userType: 'user' };

    const token = jwt.sign(
      tokenPayload,
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    const responseData = {
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
