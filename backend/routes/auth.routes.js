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
      
      // Generate JWT token
      const token = jwt.sign(
        { 
          id: req.user._id,
          email: req.user.email,
          name: req.user.name
        }, 
        process.env.JWT_SECRET, 
        { expiresIn: '7d' }
      );

      // Redirect to frontend with token
      const redirectURL = new URL('https://ulifee.netlify.app/auth/callback');
      redirectURL.searchParams.append('token', token);
      
      // Add user info to help with debugging
      redirectURL.searchParams.append('email', req.user.email);
      redirectURL.searchParams.append('name', req.user.name);

      console.log('Redirecting to:', redirectURL.toString());
      res.redirect(redirectURL.toString());
    } catch (error) {
      console.error('Auth callback error:', error);
      res.redirect('https://ulifee.netlify.app/login?error=auth_failed');
    }
  }
);

module.exports = router; 