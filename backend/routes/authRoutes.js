const express = require('express');
const router = express.Router();
const passport = require('passport');
const authController = require('../controllers/authController');

// Regular auth routes
router.post('/login', authController.login);
router.post('/signup', authController.signup);
router.get('/me', authController.getCurrentUser);
router.post('/logout', authController.logout);

// Google OAuth routes
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

router.get('/google/callback', 
  passport.authenticate('google', { session: false }),
  (req, res) => {
    const token = authController.generateToken(req.user);
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
  }
);

module.exports = router; 