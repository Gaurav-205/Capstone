const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { isAuthenticated } = require('../middleware/auth');

// Get event statistics
router.get('/statistics', isAuthenticated, eventController.getStatistics);

// ... other event routes ...

module.exports = router; 