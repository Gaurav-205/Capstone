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
router.get('/me', protect, getCurrentUser);
router.post('/set-password', isAuthenticated, setPassword);

// Google OAuth routes
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
    prompt: 'select_account'
  })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { 
    session: false, 
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=google_auth_failed`
  }),
  (req, res) => {
    try {
      console.log('Google auth callback - User:', req.user);
      
      if (!req.user) {
        console.error('No user found in request');
        return res.redirect(`${process.env.FRONTEND_URL}/login?error=no_user_found`);
      }

      // Generate JWT token
      const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
      });

      // Create redirect URL with token - Don't force password setup for Google auth users
      const redirectURL = new URL(`${process.env.FRONTEND_URL}/auth/callback`);
      redirectURL.searchParams.append('token', token);
      
      // Always set needsPassword to false for Google users
      redirectURL.searchParams.append('needsPassword', 'false');
      
      console.log('Google auth - User details:', {
        id: req.user._id,
        email: req.user.email,
        hasSetPassword: req.user.hasSetPassword,
        needsPassword: false  // Always false for Google auth
      });
      
      console.log('Redirecting to:', redirectURL.toString());
      res.redirect(redirectURL.toString());
    } catch (error) {
      console.error('Auth callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
    }
  }
);

module.exports = router; 