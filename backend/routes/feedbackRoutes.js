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
  submitResolution,
  getStatistics,
  createDiningFeedback,
  getFacilityRating,
  getDiningStatistics
} = require('../controllers/feedbackController');

// All routes require authentication
router.use(isAuthenticated);

// Create new feedback with file upload support
router.post('/', upload.array('attachments', 5), createFeedback);

// Submit dining feedback (mess and canteen)
router.post('/dining', createDiningFeedback);

// Get facility rating
router.get('/facility-rating', getFacilityRating);

// Get all feedback for the authenticated user
router.get('/', getUserFeedback);

// Get feedback statistics
router.get('/statistics', getStatistics);

// Add new route for dining statistics
router.get('/dining-statistics', getDiningStatistics);

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