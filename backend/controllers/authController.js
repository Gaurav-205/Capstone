const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

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

    req.logIn(user, (err) => {
      if (err) {
        console.error('Login error:', err);
        return res.redirect('https://kampuskart.netlify.app/login?error=login_failed');
      }

      console.log('User logged in successfully:', { userId: user._id });
      return res.redirect('https://kampuskart.netlify.app/dashboard');
    });
  })(req, res, next);
};

// Get current user
exports.getCurrentUser = (req, res) => {
  if (req.user) {
    res.json({
      id: req.user.id,
      email: req.user.email,
      name: req.user.name,
      picture: req.user.picture
    });
  } else {
    res.status(401).json({ message: 'Not authenticated' });
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