const User = require('../models/User');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/avatars';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
  }
}).single('avatar');

// Get profile
exports.getProfile = async (req, res) => {
  try {
    console.log('Getting profile for user:', req.user.id);
    const user = await User.findById(req.user.id);
    
    if (!user) {
      console.log('User not found:', req.user.id);
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('User found:', user);
    console.log('User found, returning profile');
    const profile = user.getPublicProfile();
    console.log('Profile to return:', profile);
    res.json(profile);
  } catch (error) {
    console.error('Error in getProfile:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update profile
exports.updateProfile = async (req, res) => {
  try {
    const updates = {
      name: req.body.name,
      phone: req.body.phone,
      dateOfBirth: req.body.dateOfBirth,
      gender: req.body.gender,
      studentId: req.body.studentId,
      course: req.body.course,
      semester: req.body.semester,
      batch: req.body.batch,
      hostelBlock: req.body.hostelBlock,
      roomNumber: req.body.roomNumber,
      notificationPreferences: {
        email: req.body.emailNotifications,
        sms: req.body.smsNotifications,
        push: req.body.pushNotifications
      }
    };

    // Remove undefined fields
    Object.keys(updates).forEach(key => 
      (updates[key] === undefined || updates[key] === '') && delete updates[key]
    );

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user.getPublicProfile());
  } catch (error) {
    console.error('Error in updateProfile:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Student ID already exists' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// Update avatar
exports.updateAvatar = async (req, res) => {
  try {
    upload(req, res, async function (err) {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ message: 'File upload error' });
      } else if (err) {
        return res.status(400).json({ message: err.message });
      }

      if (!req.file) {
        return res.status(400).json({ message: 'Please upload a file' });
      }

      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Delete old avatar if exists
      if (user.avatar) {
        const oldAvatarPath = path.join(__dirname, '..', user.avatar);
        if (fs.existsSync(oldAvatarPath)) {
          fs.unlinkSync(oldAvatarPath);
        }
      }

      // Update user avatar path
      user.avatar = '/uploads/avatars/' + req.file.filename;
      await user.save();

      res.json({ 
        message: 'Avatar updated successfully',
        avatar: user.avatar 
      });
    });
  } catch (error) {
    console.error('Error in updateAvatar:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validate inputs
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        success: false,
        message: 'Current password and new password are required',
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

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found',
        errors: {
          user: 'User account not found'
        }
      });
    }

    // Check if user has a password (for social login users)
    if (!user.password) {
      return res.status(400).json({
        success: false,
        message: 'No password set for this account',
        errors: {
          password: 'This account uses social login. Please set a password first.'
        }
      });
    }

    // Check current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ 
        success: false,
        message: 'Current password is incorrect',
        errors: {
          currentPassword: 'The password you entered is incorrect'
        }
      });
    }

    // Check if new password is same as current password
    if (currentPassword === newPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password must be different from current password',
        errors: {
          newPassword: 'Please choose a different password'
        }
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ 
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Error in changePassword:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      errors: {
        server: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      }
    });
  }
}; 