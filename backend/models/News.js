const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'News title is required'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  content: {
    type: String,
    required: [true, 'News content is required'],
    trim: true
  },
  date: {
    type: Date,
    required: [true, 'News date is required'],
    default: Date.now
  },
  category: {
    type: String,
    required: [true, 'News category is required'],
    enum: {
      values: ['academic', 'administrative', 'admission', 'sports', 'cultural', 'other'],
      message: '{VALUE} is not a valid news category'
    },
    default: 'other'
  },
  priority: {
    type: String,
    enum: {
      values: ['low', 'medium', 'high'],
      message: '{VALUE} is not a valid priority level'
    },
    default: 'medium'
  },
  imageUrl: {
    type: String,
    validate: {
      validator: function(value) {
        if (!value) return true; // Allow empty string/null
        // Simple URL validation
        return /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(value);
      },
      message: 'Please provide a valid URL for the news image'
    }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
newsSchema.index({ date: -1 });
newsSchema.index({ category: 1 });
newsSchema.index({ priority: 1 });

const News = mongoose.model('News', newsSchema);

module.exports = News; 