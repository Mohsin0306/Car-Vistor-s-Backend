const express = require('express');
const router = express.Router();
const { createContact, getAllContacts } = require('../controller/Contact');

// Public route - anyone can submit contact form
router.post('/submit', createContact);

// Protected route - only admin can view all contacts (if needed in future)
router.get('/all', getAllContacts);

module.exports = router;

