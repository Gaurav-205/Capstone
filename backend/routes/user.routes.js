const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { verifyToken, isAdmin } = require('../middleware/auth');

// All routes require authentication and admin privileges
router.use(verifyToken, isAdmin);

// Get all users with pagination and filters
router.get('/', userController.getAllUsers);

// Get single user
router.get('/:id', userController.getUser);

// Update user
router.put('/:id', userController.updateUser);

// Delete user
router.delete('/:id', userController.deleteUser);

// Block/Unblock user
router.patch('/:id/toggle-block', userController.toggleUserBlock);

// Change user role
router.patch('/:id/change-role', userController.changeUserRole);

module.exports = router; 