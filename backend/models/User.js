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
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email address']
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
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long']
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
    type: String,
    required: function() {
      // Only require password for non-Google users
      return !this.googleId;
    },
    minlength: [8, 'Password must be at least 8 characters long'],
    select: false,
    validate: {
      validator: function(value) {
        // Only validate password if it's being modified or it's a new user without googleId
        if ((this.isModified('password') || this.isNew) && !this.googleId) {
          // Skip validation if this is a Google user
          if (this.googleId) return true;
          
          const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
          return passwordRegex.test(value);
        }
        return true;
      },
      message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)'
    }
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
  try {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) {
      return next();
    }

    // Generate salt and hash password
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    
    // Set hasSetPassword to true if password exists
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
    if (!this.password) {
      throw new Error('Password not set for this user');
    }
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