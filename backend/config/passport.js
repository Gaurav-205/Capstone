const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

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

// Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      proxy: true
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log('Google profile:', {
          id: profile.id,
          email: profile.emails?.[0]?.value,
          name: profile.displayName
        });

        // Check if user already exists
        let user = await User.findOne({
          $or: [
            { googleId: profile.id },
            { email: profile.emails?.[0]?.value }
          ]
        });

        if (user) {
          // If user exists but doesn't have googleId (registered with email)
          if (!user.googleId) {
            user.googleId = profile.id;
          }
          
          // Always set hasSetPassword to true for Google users to bypass password setup
          user.hasSetPassword = true;
          await user.save();
          
          console.log('Existing user found and updated:', user);
          // Don't require password setup for Google login
          return done(null, { ...user.toObject(), needsPassword: false });
        }

        // If not, create new user
        user = await User.create({
          googleId: profile.id,
          name: profile.displayName,
          email: profile.emails?.[0]?.value,
          // Auto-set hasSetPassword to true for Google users to bypass password setup
          hasSetPassword: true,
          // Generated secure random password for the user
          password: crypto.randomBytes(16).toString('hex')
        });

        console.log('New user created:', user);
        // Don't require password setup for Google users
        done(null, { ...user.toObject(), needsPassword: false });
      } catch (error) {
        console.error('Google strategy error:', error);
        done(error, null);
      }
    }
  )
); 