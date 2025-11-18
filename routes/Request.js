const express = require('express');
const router = express.Router();
const {
  createVinRequest,
  getAllVinRequests,
  getVinRequestById,
  updateVinRequestStatus,
  getVinRequestsByUser
} = require('../controller/Request');

// Create VIN Request
router.post('/create', createVinRequest);

// Get all VIN requests (admin only)
router.get('/all', getAllVinRequests);

// Get VIN request by ID
router.get('/:id', getVinRequestById);

// Update VIN request status
router.put('/:id/status', updateVinRequestStatus);

// Get VIN requests by user email
router.get('/user/:email', getVinRequestsByUser);

module.exports = router;
