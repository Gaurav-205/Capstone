const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const cleanupFeedback = require('./utils/feedbackCleanup');
const passport = require('passport');
require('./config/passport');

const app = express();

// CORS configuration
const corsOptions = {
  origin: ['https://ulifetesting.netlify.app', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  credentials: true,
  maxAge: 86400 // 24 hours
};

// Apply CORS before any routes
app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

// Initialize passport
app.use(passport.initialize());

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ulife', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connected to MongoDB');
})
.catch((err) => {
  console.error('MongoDB connection error:', err);
});

// Load routes
const profileRoutes = require('./routes/profileRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const authRoutes = require('./routes/authRoutes');

// Routes
console.log('Registering routes...');
app.use('/api/profile', profileRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/auth', authRoutes);

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(500).json({ message: 'Internal server error' });
});

// Handle 404s
app.use((req, res) => {
  console.log('404 Not Found:', req.method, req.url);
  res.status(404).json({ message: 'Route not found' });
});

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Available routes:');
  console.log('- /api/profile');
  console.log('- /api/profile/test');
  console.log('- /api/feedback');
  console.log('- /api/test');
});

// Initialize cleanup interval
let cleanupInterval;

const startCleanupInterval = () => {
  // Run cleanup immediately on start
  cleanupFeedback();
  
  // Schedule cleanup to run every hour
  cleanupInterval = setInterval(cleanupFeedback, 60 * 60 * 1000);
};

const stopCleanupInterval = () => {
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
    cleanupInterval = null;
  }
};

// Start cleanup when server starts
startCleanupInterval();

// Handle cleanup on server shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Cleaning up...');
  stopCleanupInterval();
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Cleaning up...');
  stopCleanupInterval();
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  // Don't exit the process, just log the error
});

module.exports = server; 