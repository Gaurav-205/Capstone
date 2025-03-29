const mongoose = require('mongoose');

const hostelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['Boys', 'Girls', 'PG']
  },
  totalRooms: {
    type: Number,
    required: true
  },
  occupiedRooms: {
    type: Number,
    default: 0
  },
  location: {
    building: String,
    floor: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  contactInfo: {
    warden: {
      name: String,
      phone: String,
      email: String
    },
    admin: {
      name: String,
      phone: String,
      email: String
    }
  },
  facilities: [{
    name: String,
    description: String,
    isAvailable: {
      type: Boolean,
      default: true
    }
  }],
  rules: [String],
  images: [String]
}, {
  timestamps: true
});

module.exports = mongoose.model('Hostel', hostelSchema); 