const express = require('express');
const router = express.Router();
const { registerUser, registerAdmin, loginUser } = require('../controller/Auth');

// User Register route
router.post('/register', registerUser);

// Admin Register route
router.post('/admin/register', registerAdmin);

// Login route (for both users and admins)
router.post('/login', loginUser);

module.exports = router;
