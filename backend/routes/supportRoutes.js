const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');
const upload = require('../middleware/upload');
const supportController = require('../controllers/supportController');

// All routes require authentication
router.use(isAuthenticated);

// Get statistics
router.get('/statistics', supportController.getStatistics);

// FAQ routes
router.get('/faqs', supportController.getAllFAQs);
router.post('/faqs', supportController.createFAQ);

// Create new support ticket with file upload support
router.post('/', upload.array('attachments', 5), supportController.createTicket);

// Get all tickets for the authenticated user
router.get('/', supportController.getUserTickets);

// Get all tickets (admin only)
router.get('/all', supportController.getAllTickets);

// Get ticket by ID
router.get('/:id', supportController.getTicketById);

// Update ticket
router.put('/:id', upload.array('attachments', 5), supportController.updateTicket);

// Update ticket status (admin only)
router.patch('/:id/status', supportController.updateTicketStatus);

// Submit resolution (admin only)
router.post('/:id/resolve', supportController.submitResolution);

// Rate resolution
router.post('/:id/rate', supportController.rateResolution);

// Delete ticket
router.delete('/:id', supportController.deleteTicket);

module.exports = router; 