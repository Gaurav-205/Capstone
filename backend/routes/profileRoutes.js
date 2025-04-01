const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');
const {
  getProfile,
  updateProfile,
  updateAvatar,
  changePassword
} = require('../controllers/profileController');

// Test route - no auth required
router.get('/test', (req, res) => {
  res.json({ message: 'Profile routes are working' });
});

// Get profile
router.get('/', isAuthenticated, getProfile);

// Update profile
router.put('/', isAuthenticated, updateProfile);

// Update avatar
router.post('/avatar', isAuthenticated, updateAvatar);

// Change password
router.post('/change-password', isAuthenticated, changePassword);

module.exports = router; 