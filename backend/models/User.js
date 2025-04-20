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
    default: 'user'
  },
  isAdmin: {
    type: Boolean,
    default: false
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
    default: '',
    match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number']
  },
  dateOfBirth: {
    type: Date,
    validate: {
      validator: function(value) {
        if (!value) return true;
        const age = new Date().getFullYear() - new Date(value).getFullYear();
        return age >= 13;
      },
      message: 'User must be at least 13 years old'
    }
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other', 'prefer_not_to_say']
  },
  // Academic Information
  studentId: {
    type: String,
    unique: true,
    sparse: true,
    match: [/^[A-Z0-9]{8,}$/, 'Please enter a valid student ID']
  },
  course: {
    type: String,
    enum: ['B.Tech', 'M.Tech', 'B.Sc', 'M.Sc', 'BBA', 'MBA', 'PhD', 'Other']
  },
  semester: {
    type: Number,
    min: 1,
    max: 8
  },
  batch: {
    type: String,
    match: [/^[0-9]{4}$/, 'Please enter a valid batch year']
  },
  hostelBlock: {
    type: String,
    match: [/^[A-Z][0-9]{1,2}$/, 'Please enter a valid hostel block']
  },
  roomNumber: {
    type: String,
    match: [/^[0-9]{3}$/, 'Please enter a valid room number']
  },
  // Account Status
  isBlocked: {
    type: Boolean,
    default: false
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  lastLogin: {
    type: Date,
    default: Date.now
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
      return !this.googleId;
    },
    minlength: [8, 'Password must be at least 8 characters long'],
    select: false,
    validate: {
      validator: function(value) {
        if ((this.isModified('password') || this.isNew) && !this.googleId) {
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
  // Security fields
  resetPasswordToken: {
    type: String
  },
  resetPasswordExpires: {
    type: Date
  },
  passwordOtp: {
    type: String
  },
  passwordOtpExpires: {
    type: Date
  },
  otpAttempts: {
    type: Number,
    default: 0
  },
  otpLockUntil: {
    type: Date
  },
  // Activity tracking
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: {
    type: Date
  },
  lastPasswordChange: {
    type: Date,
    default: Date.now
  },
  // Profile completion
  profileCompletion: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  try {
    if (!this.isModified('password')) {
      return next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    
    if (this.password) {
      this.hasSetPassword = true;
      this.lastPasswordChange = new Date();
    }

    // Calculate profile completion
    let completion = 0;
    const fields = ['name', 'email', 'phone', 'dateOfBirth', 'gender', 'studentId', 'course', 'semester', 'batch', 'hostelBlock', 'roomNumber'];
    fields.forEach(field => {
      if (this[field]) completion += 100 / fields.length;
    });
    this.profileCompletion = Math.round(completion);

    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    if (!this.password) {
      console.error('Password comparison failed: No password set for user');
      throw new Error('Password not set for this user');
    }
    
    if (!candidatePassword) {
      console.error('Password comparison failed: No candidate password provided');
      throw new Error('No password provided for comparison');
    }

    console.log('Comparing passwords...');
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    console.log('Password comparison result:', isMatch);
    
    return isMatch;
  } catch (error) {
    console.error('Password comparison error:', error);
    throw new Error('Password comparison failed: ' + error.message);
  }
};

// Method to get public profile
userSchema.methods.getPublicProfile = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.googleId;
  delete userObject.resetPasswordToken;
  delete userObject.resetPasswordExpires;
  delete userObject.passwordOtp;
  delete userObject.passwordOtpExpires;
  delete userObject.otpAttempts;
  delete userObject.otpLockUntil;
  delete userObject.loginAttempts;
  delete userObject.lockUntil;
  return userObject;
};

// Method to check if account is locked
userSchema.methods.isLocked = function() {
  return this.lockUntil && this.lockUntil > Date.now();
};

// Method to increment login attempts
userSchema.methods.incrementLoginAttempts = async function() {
  this.loginAttempts += 1;
  if (this.loginAttempts >= 5) {
    this.lockUntil = new Date(Date.now() + 30 * 60 * 1000); // Lock for 30 minutes
  }
  await this.save();
};

// Method to reset login attempts
userSchema.methods.resetLoginAttempts = async function() {
  this.loginAttempts = 0;
  this.lockUntil = undefined;
  await this.save();
};

module.exports = mongoose.model('User', userSchema); 