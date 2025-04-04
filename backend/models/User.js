const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  googleId: {
    type: String,
    unique: true,
    sparse: true
  },
  email: {
    type: String,
    required: function() {
      return !this.googleId; // Only required if not using Google OAuth
    },
    unique: true
  },
  role: {
    type: String,
    enum: ['admin', 'user', 'student'],
    default: function() {
      return (this.email === 'gauravkhandelwal205@gmail.com' || this.email === 'khandelwalgaurav566@gmail.com') ? 'admin' : 'user';
    }
  },
  isAdmin: {
    type: Boolean,
    default: function() {
      return (this.email === 'gauravkhandelwal205@gmail.com' || this.email === 'khandelwalgaurav566@gmail.com');
    }
  },
  name: {
    type: String,
    required: function() {
      return !this.googleId; // Only required if not using Google OAuth
    }
  },
  avatar: {
    type: String,
    default: ''
  },
  phone: {
    type: String,
    default: ''
  },
  dateOfBirth: {
    type: Date
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other', 'prefer_not_to_say']
  },
  // Academic Information
  studentId: {
    type: String,
    unique: true,
    sparse: true
  },
  course: {
    type: String
  },
  semester: {
    type: String
  },
  batch: {
    type: String
  },
  hostelBlock: {
    type: String
  },
  roomNumber: {
    type: String
  },
  // Notification Preferences
  notificationPreferences: {
    email: {
      type: Boolean,
      default: true
    },
    sms: {
      type: Boolean,
      default: true
    },
    push: {
      type: Boolean,
      default: true
    }
  },
  password: {
    type: String
  },
  hasSetPassword: {
    type: Boolean,
    default: false
  },
  picture: {
    type: String
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

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    if (this.password) {
      this.hasSetPassword = true;
    }
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Method to get public profile
userSchema.methods.getPublicProfile = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.googleId;
  return userObject;
};

module.exports = mongoose.model('User', userSchema); 