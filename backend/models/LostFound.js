const mongoose = require('mongoose');

const lostFoundSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Electronics', 'Books', 'Clothing', 'Accessories', 'Documents', 'Others']
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['lost', 'found', 'claimed'],
    required: [true, 'Status is required']
  },
  reportedBy: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: {
      type: String,
      required: true
    }
  },
  image: {
    type: String,
    trim: true
  },
  contactInfo: {
    name: {
      type: String,
      required: [true, 'Contact name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Contact email is required'],
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
    },
    phone: {
      type: String,
      required: [true, 'Contact phone is required'],
      trim: true
    }
  },
  claimedBy: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    name: String,
    date: Date
  }
}, {
  timestamps: true
});

// Add text index for search functionality
lostFoundSchema.index({
  title: 'text',
  description: 'text',
  category: 'text',
  location: 'text'
});

module.exports = mongoose.model('LostFound', lostFoundSchema); 