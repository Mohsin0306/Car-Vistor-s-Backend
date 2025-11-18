const mongoose = require('mongoose');

const vinRequestSchema = new mongoose.Schema({
  vin: {
    type: String,
    required: true,
    length: 17,
    uppercase: true
  },
  userEmail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  vehicleDetails: {
    vehicle: String,
    year: String,
    make: String,
    model: String,
    engine: String,
    transmission: String,
    fuelType: String,
    mileage: String,
    condition: String
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'cancelled'],
    default: 'pending'
  },
  paymentAmount: {
    type: Number,
    default: 35
  },
  requestDate: {
    type: Date,
    default: Date.now
  },
  completedDate: {
    type: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('VinRequest', vinRequestSchema);
