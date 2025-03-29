const mongoose = require('mongoose');

const facilitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['Library', 'Lab', 'Gym', 'Sports', 'Auditorium', 'Common Room', 'Other']
  },
  description: {
    type: String,
    required: true
  },
  location: {
    building: String,
    floor: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  operatingHours: {
    monday: { open: String, close: String },
    tuesday: { open: String, close: String },
    wednesday: { open: String, close: String },
    thursday: { open: String, close: String },
    friday: { open: String, close: String },
    saturday: { open: String, close: String },
    sunday: { open: String, close: String }
  },
  isOpen: {
    type: Boolean,
    default: false
  },
  specialAccess: {
    required: Boolean,
    description: String
  },
  contactInfo: {
    inCharge: {
      name: String,
      phone: String,
      email: String
    }
  },
  images: [String],
  rules: [String]
}, {
  timestamps: true
});

module.exports = mongoose.model('Facility', facilitySchema); 