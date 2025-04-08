const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Serialize user for the session
passport.serializeUser((user, done) => {
  try {
    // Only store the user ID in the session
    done(null, user._id);
  } catch (err) {
    done(err, null);
  }
});

// Deserialize user from the session
passport.deserializeUser(async (id, done) => {
  try {
    // Find user by ID, excluding sensitive fields
    const user = await User.findById(id).select('-password -resetPasswordToken -resetPasswordExpire');
    if (!user) {
      return done(new Error('User not found'), null);
    }
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
            await user.save();
          }
          
          // Always set hasSetPassword to true for Google users to bypass password setup
          if (!user.hasSetPassword) {
            user.hasSetPassword = true;
            await user.save();
          }
          
          console.log('Existing user found and updated:', user);
          return done(null, user);
        }

        // If not, create new user
        user = await User.create({
          googleId: profile.id,
          name: profile.displayName,
          email: profile.emails?.[0]?.value,
          hasSetPassword: true,
          password: crypto.randomBytes(16).toString('hex'),
          isEmailVerified: true // Google OAuth users are automatically verified
        });

        console.log('New user created:', user);
        done(null, user);
      } catch (error) {
        console.error('Google strategy error:', error);
        done(error, null);
      }
    }
  )
); 