const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById
} = require('../controller/User');

// Get all users (admin only)
router.get('/all', getAllUsers);

// Get user by ID
router.get('/:id', getUserById);

module.exports = router;

