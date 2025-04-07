const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Configure Google Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: 'https://kampuskart.onrender.com/api/auth/google/callback',
    proxy: true
  },
  async function(accessToken, refreshToken, profile, done) {
    try {
      console.log('Google OAuth callback received:', { profileId: profile.id });
      // Check if user already exists
      let user = await User.findOne({ googleId: profile.id });
      
      if (!user) {
        console.log('Creating new user from Google profile');
        // Create new user if doesn't exist
        user = await User.create({
          googleId: profile.id,
          email: profile.emails[0].value,
          name: profile.displayName,
          picture: profile.photos[0].value
        });
      }
      
      console.log('User authenticated:', { userId: user._id });
      return done(null, user);
    } catch (error) {
      console.error('Google OAuth error:', error);
      return done(error, null);
    }
  }
));

// Serialize user for the session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from the session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Google login route handler
exports.googleLogin = passport.authenticate('google', {
  scope: ['profile', 'email'],
  prompt: 'select_account'
});

// Google callback route handler
exports.googleCallback = (req, res, next) => {
  passport.authenticate('google', (err, user) => {
    if (err) {
      console.error('Google callback error:', err);
      return res.redirect('https://kampuskart.netlify.app/login?error=' + encodeURIComponent(err.message));
    }
    
    if (!user) {
      console.error('No user returned from Google');
      return res.redirect('https://kampuskart.netlify.app/login?error=auth_failed');
    }

    try {
      // Generate JWT token
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '7d'
      });

      // Create redirect URL with token
      const redirectURL = new URL('https://kampuskart.netlify.app/auth/callback');
      redirectURL.searchParams.append('token', token);
      redirectURL.searchParams.append('needsPassword', (!user.hasSetPassword).toString());

      console.log('Redirecting to callback with token');
      return res.redirect(redirectURL.toString());
    } catch (error) {
      console.error('Token generation error:', error);
      return res.redirect('https://kampuskart.netlify.app/login?error=token_generation_failed');
    }
  })(req, res, next);
};

// Get current user data
exports.getCurrentUser = async (req, res) => {
  try {
    console.log('Getting current user data');
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      console.log('No user found with ID:', req.user.id);
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('Returning user data for:', user.email);
    res.json({
      id: user._id,
      email: user.email,
      name: user.name,
      picture: user.picture,
      role: user.role || 'user',
      hasSetPassword: user.hasSetPassword
    });
  } catch (error) {
    console.error('Error getting current user:', error);
    res.status(500).json({ message: 'Error retrieving user data' });
  }
};

// Logout
exports.logout = (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ message: 'Error logging out' });
    }
    res.json({ message: 'Logged out successfully' });
  });
}; 