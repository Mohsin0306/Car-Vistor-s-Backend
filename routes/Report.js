const express = require('express');
const router = express.Router();
const {
  advancedVinDecode,
  getAllReports,
  getReportById,
  getReportByVin
} = require('../controller/Report');

// Advanced VIN Decode (creates/saves report)
router.post('/decode', advancedVinDecode);

// Get all reports
router.get('/all', getAllReports);

// Get report by ID
router.get('/:id', getReportById);

// Get report by VIN
router.get('/vin/:vin', getReportByVin);

module.exports = router;

