const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  vin: {
    type: String,
    required: true,
    length: 17,
    uppercase: true,
    unique: true
  },
  vehicleName: {
    type: String,
    required: true,
    trim: true
  },
  reportData: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  decodedBy: {
    type: String,
    required: true,
    trim: true
  },
  decodedDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Report', reportSchema);

