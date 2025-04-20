const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { isAuthenticated, isAdmin } = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(isAuthenticated);

// Apply admin middleware to all routes
router.use(isAdmin);

// Get all users with pagination and filters
router.get('/', userController.getAllUsers);

// Get user statistics
router.get('/statistics', userController.getUserStatistics);

// Get single user
router.get('/:id', userController.getUser);

// Update user
router.put('/:id', userController.updateUser);

// Delete user
router.delete('/:id', userController.deleteUser);

// Block/Unblock user
router.patch('/:id/block', userController.toggleUserBlock);

// Change user role
router.patch('/:id/role', userController.changeUserRole);

// Unlock user account
router.patch('/:id/unlock', userController.unlockUserAccount);

// Reset user password
router.patch('/:id/reset-password', userController.resetUserPassword);

module.exports = router; 