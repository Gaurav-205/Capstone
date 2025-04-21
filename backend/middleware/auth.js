const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.isAuthenticated = async (req, res, next) => {
  try {
    console.log('Auth Middleware - Request path:', req.path);
    console.log('Auth Middleware - Headers:', {
      authorization: req.headers.authorization ? 'Bearer [token]' : 'none',
      'content-type': req.headers['content-type']
    });

    let token;

    // Get token from Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
      console.log('Auth Middleware - Token found');
    }

    // Check if token exists
    if (!token) {
      console.log('Auth Middleware - No token found');
      return res.status(401).json({ 
        message: 'Authentication required. Please log in.',
        code: 'NO_TOKEN'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Auth Middleware - Token verified:', { id: decoded.id });

      // Get user from token
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        console.log('Auth Middleware - User not found for token');
        return res.status(401).json({ 
          message: 'User not found. Please log in again.',
          code: 'USER_NOT_FOUND'
        });
      }

      console.log('Auth Middleware - User authenticated:', {
        id: user._id,
        role: user.role,
        email: user.email
      });

      req.user = user;
      next();
    } catch (error) {
      console.error('Token verification error:', error);
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ 
          message: 'Invalid token. Please log in again.',
          code: 'INVALID_TOKEN'
        });
      }
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          message: 'Token expired. Please log in again.',
          code: 'TOKEN_EXPIRED'
        });
      }
      throw error;
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ 
      message: 'Authentication error. Please try again.',
      code: 'AUTH_ERROR'
    });
  }
};

exports.isAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      console.log('Admin check - No user found');
      return res.status(401).json({ 
        message: 'Authentication required. Please log in.',
        code: 'NO_USER'
      });
    }

    console.log('Admin check - User role:', req.user.role);
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        message: 'Admin access required.',
        code: 'NOT_ADMIN'
      });
    }

    console.log('Admin check - Access granted');
    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    res.status(500).json({ 
      message: 'Authorization error. Please try again.',
      code: 'ADMIN_CHECK_ERROR'
    });
  }
}; 