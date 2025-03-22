const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
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
    required: true,
    enum: ['lost', 'found']
  },
  status: {
    type: String,
    required: true,
    enum: ['active', 'resolved', 'claimed'],
    default: 'active'
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: Date,
    required: true
  },
  images: [{
    type: String
  }],
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  claimedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  contactInfo: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Item', itemSchema); 