const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['complaint', 'suggestion', 'feedback', 'dining'],
    required: true
  },
  category: {
    type: String,
    enum: ['academic', 'facilities', 'harassment', 'other', 'mess', 'canteen'],
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
  isAnonymous: {
    type: Boolean,
    default: false
  },
  attachments: [{
    filename: String,
    url: String,
    mimetype: String
  }],
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'resolved', 'closed'],
    default: 'pending'
  },
  trackingId: {
    type: String,
    unique: true,
    sparse: true
  },
  referenceNumber: {
    type: String,
    unique: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
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
  scheduledCloseDate: {
    type: Date,
    default: null
  },
  scheduledDeletionDate: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
});

// Generate tracking ID and reference number before saving
feedbackSchema.pre('save', async function(next) {
  if (!this.trackingId) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.trackingId = `TRK${year}${month}${day}${random}`;
  }

  if (!this.referenceNumber) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const count = await this.constructor.countDocuments();
    this.referenceNumber = `FB${year}${month}${(count + 1).toString().padStart(4, '0')}`;
  }

  // Set scheduled close and deletion dates when feedback is resolved
  if (this.isModified('status') && this.status === 'resolved') {
    this.scheduledCloseDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
    this.scheduledDeletionDate = new Date(Date.now() + 4 * 24 * 60 * 60 * 1000); // 4 days from now (1 day for closing + 3 days until deletion)
  }

  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Feedback', feedbackSchema); 