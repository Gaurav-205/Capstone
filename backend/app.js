const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const lostFoundRoutes = require('./routes/lostFoundRoutes');
const authRoutes = require('./routes/auth.routes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const userRoutes = require('./routes/user.routes');
const feedbackRoutes = require('./routes/feedback.routes');
require('dotenv').config();

const app = express();

// Environment-specific URLs
const FRONTEND_URL = process.env.NODE_ENV === 'production' 
  ? process.env.FRONTEND_URL_PROD 
  : process.env.FRONTEND_URL_DEV;

const BACKEND_URL = process.env.NODE_ENV === 'production'
  ? process.env.BACKEND_URL_PROD
  : process.env.BACKEND_URL_DEV;

// CORS configuration
const corsOptions = {
  origin: function(origin, callback) {
    const allowedOrigins = process.env.CORS_ORIGINS.split(',');
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('Origin blocked by CORS:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Debug middleware - place this BEFORE routes
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  console.log('Headers:', req.headers);
  if (req.method !== 'GET') {
    console.log('Body:', req.method === 'POST' ? { ...req.body, password: '[REDACTED]' } : req.body);
  }
  next();
});

// Session configuration
app.use(session({
  secret: process.env.JWT_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax'
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Routes
app.use('/api/lost-found', lostFoundRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/users', userRoutes);
app.use('/api/feedback', feedbackRoutes);

// CORS headers middleware
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (process.env.CORS_ORIGINS.split(',').includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  next();
});

// Debug middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - Origin: ${req.headers.origin}`);
  next();
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // JWT Authentication errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token',
      errors: { auth: 'Your session is invalid. Please login again.' }
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired',
      errors: { auth: 'Your session has expired. Please login again.' }
    });
  }

  // Mongoose validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({ 
      success: false,
      message: 'Validation Error',
      errors: Object.keys(err.errors).reduce((acc, key) => {
        acc[key] = err.errors[key].message;
        return acc;
      }, {})
    });
  }

  // MongoDB duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(409).json({
      success: false,
      message: 'Duplicate field error',
      errors: {
        [field]: `This ${field} is already in use`
      }
    });
  }

  // MongoDB CastError (invalid ID)
  if (err.name === 'CastError') {
    return res.status(400).json({ 
      success: false,
      message: 'Invalid ID format',
      errors: { [err.path]: `Invalid ${err.path} format` }
    });
  }

  // Multer file upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'File too large',
      errors: { file: 'File size cannot exceed 10MB' }
    });
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      success: false,
      message: 'Invalid file upload',
      errors: { file: 'Unexpected file upload field' }
    });
  }

  // SyntaxError for invalid JSON
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      message: 'Invalid JSON',
      errors: { json: 'Invalid JSON format in request body' }
    });
  }

  // Default server error
  res.status(500).json({ 
    success: false,
    message: 'Internal Server Error',
    errors: { server: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred' }
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log('Environment:', process.env.NODE_ENV);
  console.log('Frontend URL:', FRONTEND_URL);
  console.log('Backend URL:', BACKEND_URL);
  console.log('Allowed Origins:', process.env.CORS_ORIGINS);
});

module.exports = app; 