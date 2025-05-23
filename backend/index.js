require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const session = require('express-session');
const seedMesses = require('./seed/messData');
const Mess = require('./models/Mess');
const path = require('path');
const fs = require('fs');

// Import passport config
require('./config/passport');

// Check required environment variables
const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Error: ${envVar} is not set in environment variables`);
    process.exit(1);
  }
}

const app = express();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// CORS configuration
const allowedOrigins = [
  'http://localhost:3000',
  'https://kampuskart.netlify.app',
  'https://kampuskart.onrender.com',
  process.env.FRONTEND_URL_PROD,
  process.env.FRONTEND_URL_DEV
].filter(Boolean); // Remove any undefined values

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      console.log('Request from same origin');
      return callback(null, true);
    }
    
    // Check if origin matches any allowed origin or subdomain
    const isAllowed = allowedOrigins.some(allowedOrigin => 
      origin === allowedOrigin || 
      origin.endsWith('.onrender.com') || 
      origin.endsWith('.netlify.app')
    );
    
    if (isAllowed) {
      console.log('Allowed origin:', origin);
      return callback(null, true);
    }
    
    // Block other origins
    console.log('Blocked origin:', origin);
    return callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Session configuration
const sessionConfig = {
  secret: process.env.JWT_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // Only use secure cookies in production
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // Required for cross-site cookies in production
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  },
  name: 'kampuskart.sid', // Custom session name for security
  proxy: true // Trust the reverse proxy
};

// Additional production settings
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1); // Trust first proxy
  console.log('Production session config:', {
    secure: sessionConfig.cookie.secure,
    sameSite: sessionConfig.cookie.sameSite,
    proxy: sessionConfig.proxy
  });
}

app.use(session(sessionConfig));

// Initialize passport and session
app.use(passport.initialize());
app.use(passport.session());

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Import routes
const authRoutes = require('./routes/auth.routes');
const itemRoutes = require('./routes/items.routes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const messRoutes = require('./routes/messRoutes');
const hostelRoutes = require('./routes/hostelRoutes');
const facilityRoutes = require('./routes/facilityRoutes');
const lostFoundRoutes = require('./routes/lostFoundRoutes');
const profileRoutes = require('./routes/profileRoutes');
const eventRoutes = require('./routes/eventRoutes');
const locationRoutes = require('./routes/location.routes');
const supportRoutes = require('./routes/supportRoutes');
const newsRoutes = require('./routes/newsRoutes');
const userRoutes = require('./routes/user.routes');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/mess', messRoutes);
app.use('/api/hostels', hostelRoutes);
app.use('/api/facilities', facilityRoutes);
app.use('/api/lost-found', lostFoundRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/users', userRoutes);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB successfully');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // Handle validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      message: 'Validation Error',
      errors: Object.values(err.errors).map(e => e.message)
    });
  }

  // Handle MongoDB duplicate key errors
  if (err.code === 11000) {
    return res.status(400).json({
      message: 'Duplicate key error',
      field: Object.keys(err.keyPattern)[0]
    });
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      message: 'Invalid token'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      message: 'Token expired'
    });
  }

  // Default error
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error'
  });
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log('Environment variables loaded:');
  console.log('- MONGODB_URI:', 'Set (Atlas URI)');
  console.log('- JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'Not set');
  console.log('- GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'Set' : 'Not set');
  console.log('- GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? 'Set' : 'Not set');
  console.log('- FRONTEND_URL:', process.env.FRONTEND_URL_DEV);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed.');
      process.exit(0);
    });
  });
});