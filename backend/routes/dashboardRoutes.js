const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const dashboardController = require('../controllers/dashboardController');

// Get all dashboard statistics
router.get('/stats', auth, dashboardController.getDashboardStats);

// Get upcoming events
router.get('/events/upcoming', auth, dashboardController.getUpcomingEvents);

// Get pending tasks
router.get('/tasks/pending', auth, dashboardController.getPendingTasks);

module.exports = router; 