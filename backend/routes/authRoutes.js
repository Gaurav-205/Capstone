const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Google auth routes
router.get('/google', authController.googleLogin);
router.get('/google/callback', authController.googleCallback);

// User routes
router.get('/user', authController.getCurrentUser);
router.get('/logout', authController.logout);

module.exports = router; 