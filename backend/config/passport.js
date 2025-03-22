const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const jwt = require('jsonwebtoken');

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
      callbackURL: "/api/auth/google/callback",
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
          console.log('Existing user found:', user);
          return done(null, { ...user.toObject(), needsPassword: !user.hasSetPassword });
        }

        // If not, create new user
        user = await User.create({
          googleId: profile.id,
          name: profile.displayName,
          email: profile.emails?.[0]?.value,
          hasSetPassword: false
        });

        console.log('New user created:', user);
        done(null, { ...user.toObject(), needsPassword: true });
      } catch (error) {
        console.error('Google strategy error:', error);
        done(error, null);
      }
    }
  )
); 