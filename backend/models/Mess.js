const mongoose = require('mongoose');

const messSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['mess', 'canteen'],
    required: true
  },
  location: {
    type: String,
    required: true
  },
  operatingHours: {
    breakfast: {
      open: String,
      close: String
    },
    lunch: {
      open: String,
      close: String,
      price: Number
    },
    eveningTea: {
      open: String,
      close: String
    },
    dinner: {
      open: String,
      close: String,
      price: Number
    }
  },
  isOpen: {
    type: Boolean,
    default: true
  },
  menu: [{
    mealType: {
      type: String,
      enum: ['Breakfast', 'Lunch', 'Evening Tea', 'Dinner'],
      required: true
    },
    dayOfWeek: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      required: true
    },
    items: [{
      name: String,
      isMainCourse: {
        type: Boolean,
        default: false
      }
    }]
  }],
  subscriptionPlans: [{
    mealType: {
      type: String,
      enum: ['Lunch', 'Dinner'],
      required: true
    },
    pricePerMeal: {
      type: Number,
      required: true
    }
  }],
  ratings: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    review: String,
    photos: [String],
    tags: [String],
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  averageRating: {
    type: Number,
    default: 0
  },
  subscriptions: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    mealType: {
      type: String,
      enum: ['Lunch', 'Dinner'],
      required: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    mealCount: {
      type: Number,
      default: 0
    }
  }]
}, {
  timestamps: true
});

// Calculate average rating before saving
messSchema.pre('save', function(next) {
  if (this.ratings.length > 0) {
    this.averageRating = this.ratings.reduce((acc, curr) => acc + curr.rating, 0) / this.ratings.length;
  }
  next();
});

const Mess = mongoose.model('Mess', messSchema);

module.exports = Mess; 