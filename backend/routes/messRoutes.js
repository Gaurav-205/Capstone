const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { isAuthenticated } = require('../middleware/auth');
const Mess = require('../models/Mess');
const messController = require('../controllers/messController');

// Validation middleware
const validateRating = [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('review').notEmpty().withMessage('Review is required'),
  body('tags').optional().isArray().withMessage('Tags must be an array')
];

const validateSubscription = [
  body('startDate').isISO8601().withMessage('Start date must be a valid date'),
  body('endDate').isISO8601().withMessage('End date must be a valid date')
];

// Error handling middleware
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Public routes
router.get('/filter/search', messController.getMessesByFilters);
router.get('/', messController.getAllMesses);
router.get('/:id', messController.getMessById);

// Protected routes (require authentication)
router.post('/:id/ratings', [
  isAuthenticated,
  ...validateRating,
  validateRequest
], async (req, res) => {
  try {
    const mess = await Mess.findById(req.params.id);
    if (!mess) {
      return res.status(404).json({ message: 'Mess not found' });
    }

    const { rating, review, tags } = req.body;
    mess.ratings.push({
      userId: req.user._id,
      rating,
      review,
      tags
    });

    await mess.save();
    res.status(201).json(mess);
  } catch (error) {
    res.status(500).json({ message: 'Error adding rating', error: error.message });
  }
});

router.post('/:id/subscribe', [
  isAuthenticated,
  ...validateSubscription,
  validateRequest
], async (req, res) => {
  try {
    const mess = await Mess.findById(req.params.id);
    if (!mess) {
      return res.status(404).json({ message: 'Mess not found' });
    }

    const { startDate, endDate } = req.body;
    mess.subscriptions.push({
      userId: req.user._id,
      startDate,
      endDate
    });

    await mess.save();
    res.status(201).json(mess);
  } catch (error) {
    res.status(500).json({ message: 'Error subscribing to mess', error: error.message });
  }
});

// Admin routes
router.put('/:id/menu', isAuthenticated, messController.updateMenu);
router.put('/:id/status', isAuthenticated, messController.updateStatus);

module.exports = router; 