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
    session: false,
    prompt: 'select_account'
  })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { 
    session: false, 
    failureRedirect: 'https://ulifee.netlify.app/login?error=google_auth_failed' 
  }),
  (req, res) => {
    try {
      console.log('Google auth callback - User:', req.user);
      
      if (!req.user) {
        console.error('No user found in request');
        return res.redirect('https://ulifee.netlify.app/login?error=no_user_found');
      }

      // Generate JWT token
      const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, {
        expiresIn: '7d'
      });

      // Create redirect URL without double slashes
      const baseUrl = 'https://ulifee.netlify.app';
      const redirectPath = '/auth/callback';
      const redirectURL = new URL(redirectPath, baseUrl);
      redirectURL.searchParams.append('token', token);
      redirectURL.searchParams.append('needsPassword', req.user.needsPassword);

      console.log('Redirecting to:', redirectURL.toString());
      res.redirect(redirectURL.toString());
    } catch (error) {
      console.error('Auth callback error:', error);
      res.redirect('https://ulifee.netlify.app/login?error=auth_failed');
    }
  }
);

module.exports = router; 