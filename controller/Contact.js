const { sendNotification, notifyAdmins } = require('../utils/notificationHelper');
const Admin = require('../Models/Admin');

// Create Contact Form Submission
const createContact = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    // Validate input
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ 
        success: false,
        message: 'Name, email, subject, and message are required' 
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

    // Create notification for all admins
    try {
      await notifyAdmins({
        title: 'New Contact Form Submission',
        message: `${name} (${email})${phone ? ` - Phone: ${phone}` : ''} submitted a contact form.\n\nSubject: ${subject}\n\nMessage: ${message}`,
        type: 'info',
        link: '/admin/contact',
        metadata: { 
          contactName: name,
          contactEmail: email,
          contactPhone: phone || null,
          contactSubject: subject,
          contactMessage: message
        },
      });
    } catch (notificationError) {
      console.error('Contact notification error:', notificationError);
      // Continue even if notification fails
    }

    res.status(201).json({
      success: true,
      message: 'Your message has been sent successfully. We will get back to you soon.',
      data: {
        name,
        email,
        phone: phone || null,
        subject,
        message
      }
    });
  } catch (error) {
    console.error('Contact form submission error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      success: false,
      message: 'Server error occurred while submitting your message',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get all contact submissions (for admin)
const getAllContacts = async (req, res) => {
  try {
    // This would require storing contacts in a database
    // For now, we'll return a message that contacts are in notifications
    res.json({
      success: true,
      message: 'Contact submissions are available in notifications',
      data: {
        contacts: []
      }
    });
  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error occurred while fetching contacts',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  createContact,
  getAllContacts
};

