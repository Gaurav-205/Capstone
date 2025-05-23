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
  setPassword,
  requestPasswordReset,
  verifyOTPAndResetPassword
} = require('../controllers/auth.controller');
const { isAuthenticated } = require('../middleware/auth');

// Helper function to get frontend URL based on environment
const getFrontendURL = (origin) => {
  console.log('Current NODE_ENV:', process.env.NODE_ENV);
  console.log('Request origin:', origin);
  console.log('Available URLs:', {
    prod: process.env.FRONTEND_URL_PROD,
    dev: process.env.FRONTEND_URL_DEV
  });

  // If origin is provided, use it to determine the environment
  if (origin) {
    if (origin.includes('kampuskart.onrender.com') || origin.includes('kampuskart.netlify.app')) {
      const prodURL = process.env.FRONTEND_URL_PROD || 'https://kampuskart.onrender.com';
      console.log('Using production URL based on origin:', prodURL);
      return prodURL;
    }
  }

  // Fallback to NODE_ENV check
  if (process.env.NODE_ENV === 'production') {
    const prodURL = process.env.FRONTEND_URL_PROD || 'https://kampuskart.onrender.com';
    console.log('Using production URL based on NODE_ENV:', prodURL);
    return prodURL;
  }
  
  const devURL = process.env.FRONTEND_URL_DEV || 'http://localhost:3000';
  console.log('Using development URL:', devURL);
  return devURL;
};

// Auth routes
router.post('/signup', signup);
router.post('/login', login);

// Password reset routes
router.post('/forgot-password', forgotPassword); // Legacy method
router.put('/reset-password/:token', resetPassword); // Legacy method
router.post('/reset-password/request', requestPasswordReset); // New OTP-based method
router.post('/reset-password/verify', verifyOTPAndResetPassword); // New OTP-based method

router.get('/me', protect, getCurrentUser);
router.post('/set-password', isAuthenticated, setPassword);

// Google OAuth routes
router.get(
  '/google',
  (req, res, next) => {
    // Store the intended destination and origin in session
    req.session.returnTo = req.query.returnTo || '/dashboard';
    req.session.origin = req.headers.origin || req.headers.referer;
    console.log('Auth request origin:', req.session.origin);
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
        return res.redirect(`${getFrontendURL(req.session.origin)}/login?error=auth_failed`);
      }

      if (!user) {
        console.error('No user found in Google auth callback');
        return res.redirect(`${getFrontendURL(req.session.origin)}/login?error=no_user_found`);
      }

      req.logIn(user, async (loginErr) => {
        if (loginErr) {
          console.error('Login error:', loginErr);
          return res.redirect(`${getFrontendURL(req.session.origin)}/login?error=login_failed`);
        }

        try {
          // Generate JWT token
          const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRE || '7d'
          });

          // Create redirect URL with token
          const redirectURL = new URL(`${getFrontendURL(req.session.origin)}/auth/callback`);
          redirectURL.searchParams.append('token', token);
          
          console.log('Google auth successful - Redirecting to:', redirectURL.toString());
          res.redirect(redirectURL.toString());
        } catch (error) {
          console.error('Token generation error:', error);
          res.redirect(`${getFrontendURL(req.session.origin)}/login?error=auth_failed`);
        }
      });
    })(req, res, next);
  }
);

module.exports = router; 