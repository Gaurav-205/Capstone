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

// Temporary OTP storage for development/testing when email fails
// This should NOT be used in production
const tempOtpStorage = new Map();

// Generate OTP
const generateOTP = (length = 6) => {
  // Generate a numeric OTP of specified length
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Configure email transport
const createTransporter = () => {
  console.log('Creating email transporter with service:', process.env.EMAIL_SERVICE);
  
  // Check if email credentials are provided
  if (!process.env.EMAIL_USERNAME || !process.env.EMAIL_PASSWORD) {
    console.error('EMAIL CONFIGURATION ERROR: Email username or password is missing in environment variables');
    throw new Error('Email configuration is incomplete. Please check your .env file.');
  }
  
  console.log('Using email username:', process.env.EMAIL_USERNAME);
  console.log('Email password is configured');
  
  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'Gmail',
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
    },
    tls: {
      rejectUnauthorized: false
    },
    debug: true
  });
};

// Send OTP via email
const sendOTPEmail = async (email, otp) => {
  try {
    console.log(`Attempting to send OTP email to: ${email}`);
    
    const transporter = createTransporter();
    
    // Test connection first
    await transporter.verify().catch(error => {
      console.error('Email transporter verification failed:', error);
      throw new Error(`Email configuration error: ${error.message}`);
    });
    
    console.log('Email transporter verified successfully, sending email...');
    
    // Create a formatted OTP with spaces for better readability
    const formattedOTP = otp.toString().split('').join(' ');
    
    const result = await transporter.sendMail({
      from: `"KampusKart Security" <${process.env.EMAIL_USERNAME}>`,
      to: email,
      subject: 'Your KampusKart Password Reset Code',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset</title>
          <style type="text/css">
            body { margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #4CAF50; padding: 20px; text-align: center; border-top-left-radius: 5px; border-top-right-radius: 5px; }
            .header h1 { color: white; margin: 0; font-size: 24px; }
            .content { padding: 30px; background-color: #ffffff; border: 1px solid #e9e9e9; border-bottom-left-radius: 5px; border-bottom-right-radius: 5px; }
            .otp-box { background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 32px; letter-spacing: 5px; font-weight: bold; margin: 25px 0; border-radius: 5px; border: 1px dashed #ccc; }
            .security-note { background-color: #fff8e1; padding: 15px; border-left: 4px solid #FFC107; margin: 20px 0; font-size: 14px; }
            .footer { padding: 15px; text-align: center; font-size: 12px; color: #777; margin-top: 20px; }
            .button { display: inline-block; background-color: #4CAF50; color: white; text-decoration: none; padding: 10px 20px; border-radius: 5px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>KampusKart Security</h1>
            </div>
            <div class="content">
              <p>Hello,</p>
              <p>We received a request to reset your KampusKart account password. Please use the following One-Time Password (OTP) to complete your password reset:</p>
              <div class="otp-box">${formattedOTP}</div>
              <p>This code will expire in <strong>10 minutes</strong> for security reasons.</p>
              
              <div class="security-note">
                <strong>Security Note:</strong> If you didn't request this password reset, please ignore this email or contact support immediately as someone may be trying to access your account.
              </div>
              
              <p>If you have any issues, please contact our support team for assistance.</p>
              
              <p>Thank you,<br>The KampusKart Team</p>
            </div>
            <div class="footer">
              <p>This is an automated message from KampusKart. Please do not reply to this email.</p>
              <p>&copy; ${new Date().getFullYear()} KampusKart. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `KampusKart Security Alert: Your password reset OTP is: ${otp}. This code will expire in 10 minutes. If you didn't request this reset, please contact support immediately.`
    });
    
    console.log('Email sent successfully:', result.messageId);
    return true;
  } catch (error) {
    console.error('Error sending OTP email:', error);
    console.error('Error details:', error.stack);
    
    if (error.code === 'EAUTH') {
      console.error('Authentication error - check email credentials');
    } else if (error.code === 'ESOCKET') {
      console.error('Socket error - check network connection');
    } else if (error.code === 'EENVELOPE') {
      console.error('Envelope error - check email addresses');
    }
    
    throw error; // Re-throw to handle in the calling function
  }
};

// Alternative email service as fallback
const sendOTPViaAlternativeService = async (email, otp) => {
  try {
    console.log('Attempting to send OTP via alternative service');
    
    // Check if email credentials are provided
    if (!process.env.EMAIL_USERNAME || !process.env.EMAIL_PASSWORD) {
      console.error('Alternative email service error: Missing email credentials');
      return false;
    }
    
    // Use more reliable SMTP settings
    const altTransporter = nodemailer.createTransport({
      host: 'smtp.gmail.com', // For Gmail
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      },
      tls: {
        rejectUnauthorized: false
      }
    });
    
    // Verify connection before sending
    await altTransporter.verify().catch(error => {
      console.error('Alternative email service verification failed:', error);
      throw new Error(`Alternative email configuration error: ${error.message}`);
    });
    
    const result = await altTransporter.sendMail({
      from: `"KampusKart Support" <${process.env.EMAIL_USERNAME}>`,
      to: email,
      subject: 'Your Password Reset Code',
      text: `Your KampusKart password reset code is: ${otp}. This code will expire in 10 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee;">
          <div style="background-color: #4CAF50; padding: 15px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">KampusKart Password Reset</h1>
          </div>
          <div style="padding: 20px;">
            <p>Hello,</p>
            <p>You've requested a password reset. Please use the following code to reset your password:</p>
            <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 28px; letter-spacing: 5px; font-weight: bold; margin: 20px 0;">${otp}</div>
            <p>This code will expire in 10 minutes.</p>
            <p>If you didn't request this, please ignore this email.</p>
          </div>
          <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; color: #777;">
            <p>© ${new Date().getFullYear()} KampusKart. All rights reserved.</p>
          </div>
        </div>
      `
    });
    
    console.log('OTP sent via alternative service:', result.messageId);
    return true;
  } catch (error) {
    console.error('Alternative email service error:', error);
    if (error.code === 'EAUTH') {
      console.error('Authentication error - check alternative email credentials');
    } else if (error.code === 'ESOCKET') {
      console.error('Socket error - check network connection for alternative service');
    }
    return false;
  }
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
    console.log('Server: Starting login process');
    const { email, password } = req.body;

    // Validate required fields with more detailed errors
    if (!email && !password) {
      console.log('Server: Missing email and password');
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
        errors: {
          email: 'Email is required',
          password: 'Password is required'
        }
      });
    }
    
    if (!email) {
      console.log('Server: Missing email');
      return res.status(400).json({
        success: false,
        message: 'Please provide email',
        errors: {
          email: 'Email is required'
        }
      });
    }
    
    if (!password) {
      console.log('Server: Missing password');
      return res.status(400).json({
        success: false,
        message: 'Please provide password',
        errors: {
          password: 'Password is required'
        }
      });
    }

    // Check if user exists
    console.log('Server: Finding user by email:', email);
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      console.log('Server: No account found with email:', email);
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
      console.log('Server: Password not set for user:', email);
      return res.status(401).json({
        success: false,
        message: 'Password not set',
        errors: {
          password: 'Please set your password first'
        }
      });
    }

    // Check password
    console.log('Server: Verifying password for user:', email);
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log('Server: Incorrect password for user:', email);
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
    console.log('Server: Login successful for:', email);

    // Return success response with user data
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
    console.error('Server: Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      errors: {
        server: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      }
    });
  }
};

// Request OTP for password reset
exports.requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
        errors: {
          email: 'Please provide your email address'
        }
      });
    }
    
    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      // For security, don't reveal that the user doesn't exist
      console.log(`Password reset requested for non-existent email: ${email}`);
      return res.status(200).json({
        success: true,
        message: 'If a user with this email exists, an OTP has been sent.'
      });
    }
    
    // Check if user is locked out due to too many attempts
    if (user.otpLockUntil && user.otpLockUntil > Date.now()) {
      const waitMinutes = Math.ceil((user.otpLockUntil - Date.now()) / 60000);
      console.log(`User ${email} is locked out for ${waitMinutes} more minutes due to too many OTP attempts`);
      return res.status(429).json({
        success: false,
        message: `Too many attempts. Please try again in ${waitMinutes} minutes.`
      });
    }
    
    // Generate and store OTP
    const otp = generateOTP();
    console.log(`Generated OTP for ${email}`); // Only log that we generated an OTP, not the value
    
    user.passwordOtp = await bcrypt.hash(otp, 10); // Store hashed OTP
    user.passwordOtpExpires = Date.now() + 600000; // 10 minutes
    user.otpAttempts = 0;
    await user.save();
    
    console.log(`OTP saved to database for user ${email}`);
    
    // In development mode, we'll log the OTP to console but not expose it in the response
    if (process.env.NODE_ENV === 'development') {
      console.log(`DEV MODE - OTP for testing: ${otp}`);
      
      // Try to send email, but continue even if it fails
      try {
        await sendOTPEmail(user.email, otp);
        console.log(`OTP email sent successfully to ${email}`);
      } catch (emailError) {
        console.error(`Failed to send OTP email in development mode:`, emailError.message);
        console.log(`Use the OTP shown above for testing purposes.`);
      }
      
      // Store in temporary storage for testing
      tempOtpStorage.set(email.toLowerCase(), {
        otp,
        expires: new Date(Date.now() + 600000)
      });
      
      return res.status(200).json({
        success: true,
        message: 'OTP has been generated and saved. In development mode, check server console for the OTP.',
        expiresIn: 600
      });
    }
    
    // In production mode, attempt to send email and handle errors
    try {
      // Attempt to send via primary method
      await sendOTPEmail(user.email, otp);
      console.log(`OTP email sent successfully to ${email}`);
      
      // Return success message
      return res.status(200).json({
        success: true,
        message: 'OTP has been sent to your email.',
        expiresIn: 600 // 10 minutes in seconds
      });
    } catch (primaryEmailError) {
      console.error(`Primary email method failed for ${email}:`, primaryEmailError);
      
      // Try alternative email method
      const altEmailSent = await sendOTPViaAlternativeService(user.email, otp);
      
      if (altEmailSent) {
        console.log(`OTP sent via alternative service to ${email}`);
        return res.status(200).json({
          success: true,
          message: 'OTP has been sent to your email.',
          expiresIn: 600
        });
      }
      
      // Reset OTP data in the database since email failed
      user.passwordOtp = undefined;
      user.passwordOtpExpires = undefined;
      await user.save();
      
      // Return specific error based on the email error
      if (primaryEmailError.code === 'EAUTH') {
        return res.status(500).json({
          success: false,
          message: 'Failed to send OTP due to email configuration issues. Please try again later or contact support.'
        });
      } else {
        return res.status(500).json({
          success: false,
          message: 'Failed to send OTP email. Please try again later.'
        });
      }
    }
  } catch (error) {
    console.error('Password reset request error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during password reset request.',
      errors: {
        server: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      }
    });
  }
};

// Verify OTP and reset password
exports.verifyOTPAndResetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    
    // Validate inputs
    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email, OTP, and new password',
        errors: {
          validation: 'All fields are required'
        }
      });
    }
    
    // Password validation
    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password is too short',
        errors: {
          password: 'Password must be at least 8 characters long'
        }
      });
    }
    
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message: 'Password does not meet requirements',
        errors: {
          password: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)'
        }
      });
    }
    
    const normalizedEmail = email.toLowerCase();
    
    // Find user by email
    const user = await User.findOne({ 
      email: normalizedEmail
    });
    
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP. Please request a new one.',
        errors: {
          otp: 'OTP is invalid or has expired'
        }
      });
    }
    
    // Check if OTP is expired
    const isOtpExpired = user.passwordOtpExpires ? user.passwordOtpExpires < Date.now() : true;
    
    // Check if user is locked out due to too many attempts
    if (user.otpLockUntil && user.otpLockUntil > Date.now()) {
      const waitMinutes = Math.ceil((user.otpLockUntil - Date.now()) / 60000);
      return res.status(429).json({
        success: false,
        message: `Too many attempts. Please try again in ${waitMinutes} minutes.`
      });
    }
    
    // First check temporary storage in development mode
    let isOtpValid = false;
    if (process.env.NODE_ENV === 'development') {
      const tempOtpData = tempOtpStorage.get(normalizedEmail);
      if (tempOtpData && tempOtpData.expires > new Date()) {
        console.log(`DEV MODE: Checking temporary OTP for ${normalizedEmail}`);
        isOtpValid = tempOtpData.otp === otp;
        if (isOtpValid) {
          console.log(`DEV MODE: Valid temporary OTP provided for ${normalizedEmail}`);
          // Clean up from temporary storage
          tempOtpStorage.delete(normalizedEmail);
        }
      }
    }
    
    // If not valid from temp storage, check database
    if (!isOtpValid && user.passwordOtp) {
      // Verify OTP from database
      if (isOtpExpired) {
        return res.status(400).json({
          success: false,
          message: 'OTP has expired. Please request a new one.',
          errors: {
            otp: 'OTP has expired'
          }
        });
      }
      
      isOtpValid = await bcrypt.compare(otp, user.passwordOtp);
    }
    
    if (!isOtpValid) {
      // Increment attempt counter
      user.otpAttempts += 1;
      
      // Lock account after 5 failed attempts
      if (user.otpAttempts >= 5) {
        user.otpLockUntil = Date.now() + 30 * 60000; // 30 minutes
        await user.save();
        
        return res.status(429).json({
          success: false,
          message: 'Too many failed attempts. Account locked for 30 minutes.',
          errors: {
            otp: 'Account locked due to too many invalid attempts'
          }
        });
      }
      
      await user.save();
      
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP. Please check and try again.',
        errors: {
          otp: 'The OTP you entered is incorrect'
        },
        attemptsLeft: 5 - user.otpAttempts
      });
    }
    
    // OTP is valid, reset password
    user.password = newPassword;
    user.passwordOtp = undefined;
    user.passwordOtpExpires = undefined;
    user.otpAttempts = 0;
    user.otpLockUntil = undefined;
    user.hasSetPassword = true;
    
    await user.save();
    
    // Generate token for auto-login
    const token = createToken(user._id);
    
    return res.status(200).json({
      success: true,
      message: 'Password has been reset successfully.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role || 'user',
        hasSetPassword: true
      }
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during password reset.',
      errors: {
        server: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      }
    });
  }
};

// Forgot password (legacy method - kept for backward compatibility)
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

// Reset password (legacy method - kept for backward compatibility)
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
    
    // Make sure we always have a name, using email username as fallback
    let userName = user.name;
    if (!userName || userName.trim() === '') {
      console.log('Name missing for user, using email as fallback');
      if (user.email) {
        // Extract username from email
        userName = user.email.split('@')[0];
        // Capitalize first letter and replace dots/underscores with spaces
        userName = userName.charAt(0).toUpperCase() + userName.slice(1).replace(/[._]/g, ' ');
      } else {
        userName = 'User';
      }
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: userName,
        email: user.email,
        hasSetPassword: user.hasSetPassword,
        role: user.role || 'user',
        avatar: user.avatar
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