const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.isAuthenticated = async (req, res, next) => {
  try {
    console.log('Auth Middleware - Headers:', req.headers);
    let token;

    // Get token from Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
      console.log('Auth Middleware - Token:', token);
    }

    // Check if token exists
    if (!token) {
      console.log('Auth Middleware - No token found');
      return res.status(401).json({ message: 'Not authorized - No token' });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Auth Middleware - Decoded token:', decoded);

      // Get user from token (using id instead of userId to match token creation)
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        console.log('Auth Middleware - User not found');
        return res.status(401).json({ message: 'Not authorized - User not found' });
      }

      console.log('Auth Middleware - User found:', user._id);
      // Add user to request object
      req.user = user;
      next();
    } catch (error) {
      console.error('Token verification error:', error);
      return res.status(401).json({ message: 'Not authorized - Invalid token' });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.isAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized - No user found' });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized - Admin access required' });
    }

    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}; 