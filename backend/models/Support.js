const mongoose = require('mongoose');

// FAQ Schema for common questions and answers
const faqSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
    trim: true
  },
  answer: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: ['account', 'facility', 'technical', 'service', 'other'],
    default: 'other'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

// Support ticket schema
const supportSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: ['technical', 'account', 'facility', 'service', 'other'],
    required: true
  },
  // Making priority optional
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['open', 'in_progress', 'resolved', 'closed'],
    default: 'open'
  },
  ticketNumber: {
    type: String,
    unique: true
  },
  attachments: [{
    filename: String,
    url: String,
    mimetype: String
  }],
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  expectedResolutionDate: Date,
  resolution: {
    description: String,
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    resolvedAt: Date
  },
  userRating: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
supportSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Generate ticket number if not already assigned
  if (!this.ticketNumber) {
    const timestamp = new Date().getTime().toString().slice(-6);
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    this.ticketNumber = `SUP-${timestamp}-${random}`;
  }
  
  next();
});

const Support = mongoose.model('Support', supportSchema);
const FAQ = mongoose.model('FAQ', faqSchema);

module.exports = { Support, FAQ }; 