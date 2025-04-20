const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Get all users with pagination and filters
exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, role, status, course, batch } = req.query;
    const query = {};

    // Add search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } }
      ];
    }

    // Add role filter
    if (role && role !== 'all') {
      query.role = role;
    }

    // Add status filter
    if (status && status !== 'all') {
      if (status === 'blocked') {
        query.isBlocked = true;
      } else if (status === 'locked') {
        query.lockUntil = { $gt: new Date() };
      } else if (status === 'active') {
        query.isBlocked = false;
        query.lockUntil = { $exists: false };
      }
    }

    // Add course filter
    if (course && course !== 'all') {
      query.course = course;
    }

    // Add batch filter
    if (batch && batch !== 'all') {
      query.batch = batch;
    }

    const users = await User.find(query)
      .select('-password -resetPasswordToken -resetPasswordExpires -passwordOtp -passwordOtpExpires')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.status(200).json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      totalUsers: total
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
};

// Get single user
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -resetPasswordToken -resetPasswordExpires -passwordOtp -passwordOtpExpires');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Error fetching user' });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const {
      name,
      role,
      isBlocked,
      phone,
      dateOfBirth,
      gender,
      studentId,
      course,
      semester,
      batch,
      hostelBlock,
      roomNumber,
      notificationPreferences
    } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields
    if (name) user.name = name;
    if (role) user.role = role;
    if (typeof isBlocked === 'boolean') user.isBlocked = isBlocked;
    if (phone) user.phone = phone;
    if (dateOfBirth) user.dateOfBirth = dateOfBirth;
    if (gender) user.gender = gender;
    if (studentId) user.studentId = studentId;
    if (course) user.course = course;
    if (semester) user.semester = semester;
    if (batch) user.batch = batch;
    if (hostelBlock) user.hostelBlock = hostelBlock;
    if (roomNumber) user.roomNumber = roomNumber;
    if (notificationPreferences) {
      user.notificationPreferences = {
        ...user.notificationPreferences,
        ...notificationPreferences
      };
    }

    await user.save();

    res.status(200).json({
      message: 'User updated successfully',
      user: user.getPublicProfile()
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Error updating user' });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.remove();
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Error deleting user' });
  }
};

// Block/Unblock user
exports.toggleUserBlock = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isBlocked = !user.isBlocked;
    await user.save();

    res.status(200).json({
      message: `User ${user.isBlocked ? 'blocked' : 'unblocked'} successfully`,
      isBlocked: user.isBlocked
    });
  } catch (error) {
    console.error('Toggle user block error:', error);
    res.status(500).json({ message: 'Error toggling user block status' });
  }
};

// Change user role
exports.changeUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!['admin', 'user', 'student'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    user.role = role;
    user.isAdmin = role === 'admin';
    await user.save();

    res.status(200).json({
      message: 'User role updated successfully',
      role: user.role
    });
  } catch (error) {
    console.error('Change user role error:', error);
    res.status(500).json({ message: 'Error changing user role' });
  }
};

// Get user statistics
exports.getUserStatistics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isBlocked: false });
    const blockedUsers = await User.countDocuments({ isBlocked: true });
    const lockedUsers = await User.countDocuments({ lockUntil: { $gt: new Date() } });
    const adminUsers = await User.countDocuments({ role: 'admin' });
    const studentUsers = await User.countDocuments({ role: 'student' });
    const regularUsers = await User.countDocuments({ role: 'user' });

    const courseStats = await User.aggregate([
      { $match: { course: { $exists: true } } },
      { $group: { _id: '$course', count: { $sum: 1 } } }
    ]);

    const batchStats = await User.aggregate([
      { $match: { batch: { $exists: true } } },
      { $group: { _id: '$batch', count: { $sum: 1 } } }
    ]);

    res.status(200).json({
      totalUsers,
      activeUsers,
      blockedUsers,
      lockedUsers,
      roleDistribution: {
        admin: adminUsers,
        student: studentUsers,
        user: regularUsers
      },
      courseDistribution: courseStats,
      batchDistribution: batchStats
    });
  } catch (error) {
    console.error('Get user statistics error:', error);
    res.status(500).json({ message: 'Error fetching user statistics' });
  }
};

// Unlock user account
exports.unlockUserAccount = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.lockUntil = undefined;
    user.loginAttempts = 0;
    await user.save();

    res.status(200).json({
      message: 'User account unlocked successfully'
    });
  } catch (error) {
    console.error('Unlock user account error:', error);
    res.status(500).json({ message: 'Error unlocking user account' });
  }
};

// Reset user password
exports.resetUserPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.password = newPassword;
    user.hasSetPassword = true;
    user.lastPasswordChange = new Date();
    await user.save();

    res.status(200).json({
      message: 'User password reset successfully'
    });
  } catch (error) {
    console.error('Reset user password error:', error);
    res.status(500).json({ message: 'Error resetting user password' });
  }
}; 