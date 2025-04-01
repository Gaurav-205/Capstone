const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  createFeedback,
  getUserFeedback,
  getFeedbackById,
  updateFeedbackStatus,
  updateFeedback,
  deleteFeedback,
  submitResolution
} = require('../controllers/feedbackController');

// All routes require authentication
router.use(isAuthenticated);

// Create new feedback with file upload support
router.post('/', upload.array('attachments', 5), createFeedback);

// Get all feedback for the authenticated user
router.get('/', getUserFeedback);

// Get single feedback by ID
router.get('/:id', getFeedbackById);

// Update feedback
router.put('/:id', upload.array('attachments', 5), updateFeedback);

// Delete feedback
router.delete('/:id', deleteFeedback);

// Update feedback status
router.patch('/:id/status', updateFeedbackStatus);

// Submit resolution for feedback
router.post('/:id/resolve', submitResolution);

module.exports = router; 