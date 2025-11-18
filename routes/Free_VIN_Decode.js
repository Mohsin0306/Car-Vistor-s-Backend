const express = require('express');
const router = express.Router();
const { freeVinDecode } = require('../controller/Free_VIN_Decode');

// Free VIN Decode route
router.post('/decode', freeVinDecode);

module.exports = router;
