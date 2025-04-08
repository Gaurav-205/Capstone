const fs = require('fs');
const path = require('path');

const eventModelContent = `const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  date: {
    type: String,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['academic', 'social', 'sports', 'cultural', 'other'],
    default: 'other'
  },
  // Multi-day event support
  isMultiDay: {
    type: Boolean,
    default: false
  },
  startDate: {
    type: String
  },
  endDate: {
    type: String
  },
  startTime: {
    type: String
  },
  endTime: {
    type: String
  },
  imageUrl: {
    type: String
  },
  registrationUrl: {
    type: String
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  capacity: {
    type: Number,
    min: 0,
    default: 0
  },
  registeredParticipants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
    default: 'upcoming'
  }
}, {
  timestamps: true
});

// Add index for efficient querying
eventSchema.index({ date: 1, status: 1 });
eventSchema.index({ type: 1 });

// Method to check if event is full
eventSchema.methods.isFull = function() {
  if (this.capacity === 0) return false; // Unlimited capacity
  return this.registeredParticipants.length >= this.capacity;
};

// Method to get available spots
eventSchema.methods.getAvailableSpots = function() {
  if (this.capacity === 0) return Infinity; // Unlimited capacity
  return this.capacity - this.registeredParticipants.length;
};

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;`;

const filePath = path.join(__dirname, 'models', 'Event.js');

fs.writeFileSync(filePath, eventModelContent);

console.log('Event model file created successfully at:', filePath); 