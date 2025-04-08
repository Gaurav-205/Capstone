const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { isAuthenticated } = require('../middleware/auth');

// Get event statistics
router.get('/statistics', isAuthenticated, eventController.getStatistics);

// Get all events
router.get('/', isAuthenticated, eventController.getAllEvents);

// Get single event by ID
router.get('/:id', isAuthenticated, eventController.getEventById);

// Create a new event
router.post('/', isAuthenticated, eventController.createEvent);

// Update an event
router.put('/:id', isAuthenticated, eventController.updateEvent);

// Delete an event
router.delete('/:id', isAuthenticated, eventController.deleteEvent);

module.exports = router; 