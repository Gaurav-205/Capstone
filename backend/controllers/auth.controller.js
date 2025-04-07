const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');

// Create JWT Token
const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// Register user
exports.signup = async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    // Log received data for debugging (excluding passwords)
    console.log('Signup request received:', { name, email });

    // Basic validation
    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, email, password, and confirm password'
      });
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email is already registered'
      });
    }

    // Create new user
    const user = new User({
      name,
      email: email.toLowerCase(),
      password
    });

    // Save user - password hashing and validation will be handled by the User model
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    // Return success response with user data (excluding sensitive information)
    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: user.getPublicProfile(),
      token: token
    });

  } catch (error) {
    console.error('Signup error:', error);

    // Handle validation errors from mongoose
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: {
          validation: messages.join('. '),
          details: error.errors
        }
      });
    }

    // Handle duplicate key errors (e.g., duplicate email)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Email is already registered',
        errors: {
          email: 'This email address is already in use'
        }
      });
    }

    // Handle password validation errors
    if (error.name === 'PasswordValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Password validation failed',
        errors: {
          password: error.message
        }
      });
    }

    // Handle network/server errors
    return res.status(500).json({
      success: false,
      message: 'An error occurred during registration',
      errors: {
        server: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }
    });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
        errors: {
          email: !email ? 'Email is required' : null,
          password: !password ? 'Password is required' : null
        }
      });
    }

    // Check if user exists and include password for comparison
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
        errors: {
          email: 'No account found with this email'
        }
      });
    }

    // Check if user has set a password
    if (!user.hasSetPassword) {
      return res.status(401).json({
        success: false,
        message: 'Password not set',
        errors: {
          password: 'Please set your password first'
        }
      });
    }

    // Check password using the model's method
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
        errors: {
          password: 'Incorrect password'
        }
      });
    }

    // Set admin role for specific emails
    if (email === 'gauravkhandelwal205@gmail.com' || email === 'khandelwalgaurav566@gmail.com') {
      user.role = 'admin';
      await user.save();
    }

    // Generate token
    const token = createToken(user._id);

    // Log successful login
    console.log('Login successful for:', email);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        hasSetPassword: user.hasSetPassword,
        role: user.role || 'user'
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Forgot password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate reset token
    const resetToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // In a real application, send email with reset link
    res.json({ message: 'Password reset email sent' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Reset password
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(400).json({ message: 'Invalid token' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get current user
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        hasSetPassword: user.hasSetPassword,
        role: user.role || 'user'
      }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Set password for Google OAuth users
exports.setPassword = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({
        message: 'Please provide a valid password (minimum 6 characters)'
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // For Google users, automatically mark as having set password
    if (user.googleId) {
      user.hasSetPassword = true;
      await user.save();
      
      return res.json({
        success: true,
        message: 'Password status updated for Google user',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          hasSetPassword: user.hasSetPassword
        }
      });
    }

    // For non-Google users, set the new password
    user.password = password;
    user.hasSetPassword = true;
    await user.save();

    res.json({
      success: true,
      message: 'Password set successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        hasSetPassword: user.hasSetPassword
      }
    });
  } catch (error) {
    console.error('Set password error:', error);
    res.status(500).json({ message: 'Error setting password' });
  }
}; 