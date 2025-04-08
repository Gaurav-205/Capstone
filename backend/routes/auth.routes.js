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
  (req, res, next) => {
    // Store the intended destination in session
    req.session.returnTo = req.query.returnTo || '/dashboard';
    next();
  },
  passport.authenticate('google', {
    scope: ['profile', 'email']
  })
);

router.get(
  '/google/callback',
  (req, res, next) => {
    passport.authenticate('google', (err, user, info) => {
      if (err) {
        console.error('Google auth error:', err);
        return res.redirect(`${process.env.FRONTEND_URL_DEV}/login?error=auth_failed`);
      }

      if (!user) {
        console.error('No user found in Google auth callback');
        return res.redirect(`${process.env.FRONTEND_URL_DEV}/login?error=no_user_found`);
      }

      req.logIn(user, async (loginErr) => {
        if (loginErr) {
          console.error('Login error:', loginErr);
          return res.redirect(`${process.env.FRONTEND_URL_DEV}/login?error=login_failed`);
        }

        try {
          // Generate JWT token
          const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRE || '7d'
          });

          // Create redirect URL with token
          const redirectURL = new URL(`${process.env.FRONTEND_URL_DEV}/auth/callback`);
          redirectURL.searchParams.append('token', token);
          
          console.log('Google auth successful - Redirecting to:', redirectURL.toString());
          res.redirect(redirectURL.toString());
        } catch (error) {
          console.error('Token generation error:', error);
          res.redirect(`${process.env.FRONTEND_URL_DEV}/login?error=auth_failed`);
        }
      });
    })(req, res, next);
  }
);

module.exports = router; 