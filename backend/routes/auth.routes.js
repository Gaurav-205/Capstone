const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const { protect } = require('../middleware/auth.middleware');
const {
  signup,
  login,
  forgotPassword,
  resetPassword,
  getCurrentUser,
  setPassword
} = require('../controllers/auth.controller');
const { isAuthenticated } = require('../middleware/auth');

// Auth routes
router.post('/signup', signup);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:resetToken', resetPassword);
router.get('/me', isAuthenticated, getCurrentUser);
router.post('/set-password', isAuthenticated, setPassword);

// Google OAuth routes
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false
  })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login?error=google_auth_failed' }),
  (req, res) => {
    try {
      // Generate JWT token
      const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, {
        expiresIn: '7d'
      });

      // Redirect to frontend with token and password setup flag
      const redirectURL = req.user.needsPassword
        ? `${process.env.FRONTEND_URL}/set-password?token=${token}`
        : `${process.env.FRONTEND_URL}/auth/callback?token=${token}`;

      res.redirect(redirectURL);
    } catch (error) {
      console.error('Auth callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
    }
  }
);

module.exports = router; 