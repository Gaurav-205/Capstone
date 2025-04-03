const mongoose = require('mongoose');

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
    type: Date,
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
  category: {
    type: String,
    required: true,
    enum: ['Academic', 'Cultural', 'Sports', 'Technical', 'Other']
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  capacity: {
    type: Number,
    required: true,
    min: 1
  },
  registeredParticipants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Add index for efficient querying
eventSchema.index({ date: 1, status: 1 });
eventSchema.index({ category: 1 });

// Method to check if event is full
eventSchema.methods.isFull = function() {
  return this.registeredParticipants.length >= this.capacity;
};

// Method to get available spots
eventSchema.methods.getAvailableSpots = function() {
  return this.capacity - this.registeredParticipants.length;
};

const Event = mongoose.model('Event', eventSchema);

module.exports = Event; 