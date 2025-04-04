const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedback.controller');
const { verifyToken } = require('../middleware/auth');

// Protected routes
router.use(verifyToken);

// Get feedback statistics
router.get('/statistics', feedbackController.getStatistics);

module.exports = router; 