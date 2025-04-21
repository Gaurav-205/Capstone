const mongoose = require('mongoose');

const hostelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Hostel name is required'],
    trim: true
  },
  type: {
    type: String,
    required: [true, 'Hostel type is required'],
    enum: ['Boys', 'Girls', 'PG']
  },
  totalRooms: {
    type: Number,
    required: [true, 'Total rooms is required'],
    min: [1, 'Total rooms must be at least 1']
  },
  occupiedRooms: {
    type: Number,
    default: 0,
    validate: {
      validator: function(v) {
        return v <= this.totalRooms;
      },
      message: 'Occupied rooms cannot exceed total rooms'
    }
  },
  location: {
    building: {
      type: String,
      required: [true, 'Building name is required']
    },
    floor: {
      type: String,
      required: [true, 'Floor number/name is required']
    },
    type: {
      type: String,
      default: "Point"
    },
    coordinates: {
      type: [Number],
      default: [0, 0]
    }
  },
  contactInfo: {
    warden: {
      name: {
        type: String,
        required: [true, 'Warden name is required']
      },
      phone: {
        type: String,
        required: [true, 'Warden phone number is required']
      },
      email: {
        type: String,
        required: [true, 'Warden email is required'],
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
      }
    }
  },
  facilities: [{
    name: {
      type: String,
      required: [true, 'Facility name is required']
    },
    description: {
      type: String,
      required: [true, 'Facility description is required']
    },
    isAvailable: {
      type: Boolean,
      default: true
    }
  }],
  rules: [{
    type: String,
    trim: true
  }],
  images: [{
    type: String,
    trim: true
  }],
  ratings: {
    cleanliness: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    food: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    security: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    maintenance: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    overall: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    }
  },
  fees: {
    monthly: {
      type: Number,
      default: 0,
      min: 0
    },
    security: {
      type: Number,
      default: 0,
      min: 0
    },
    mess: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  amenities: {
    wifi: {
      type: Boolean,
      default: false
    },
    laundry: {
      type: Boolean,
      default: false
    },
    mess: {
      type: Boolean,
      default: false
    },
    sports: {
      type: Boolean,
      default: false
    },
    security: {
      type: Boolean,
      default: false
    },
    cleaning: {
      type: Boolean,
      default: false
    },
    transport: {
      type: Boolean,
      default: false
    },
    parking: {
      type: Boolean,
      default: false
    },
    medical: {
      type: Boolean,
      default: false
    },
    library: {
      type: Boolean,
      default: false
    },
    computer: {
      type: Boolean,
      default: false
    }
  },
  timings: {
    inTime: {
      type: String,
      required: [true, 'In time is required']
    },
    outTime: {
      type: String,
      required: [true, 'Out time is required']
    },
    visitingHours: {
      type: String,
      required: [true, 'Visiting hours are required']
    }
  },
  messDetails: {
    type: {
      type: String,
      enum: ['Vegetarian', 'Non-Vegetarian', 'Both'],
      required: [true, 'Mess type is required']
    },
    timings: {
      breakfast: {
        type: String,
        required: [true, 'Breakfast timing is required']
      },
      lunch: {
        type: String,
        required: [true, 'Lunch timing is required']
      },
      dinner: {
        type: String,
        required: [true, 'Dinner timing is required']
      }
    },
    menu: {
      type: Map,
      of: [String]
    }
  }
}, {
  timestamps: true
});

hostelSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Hostel', hostelSchema); 