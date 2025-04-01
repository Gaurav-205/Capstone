const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const lostFoundController = require('../controllers/lostFoundController');
const authMiddleware = require('../middleware/authMiddleware');

// Validation middleware
const itemValidation = [
  check('title').trim().notEmpty().withMessage('Title is required'),
  check('description').trim().notEmpty().withMessage('Description is required'),
  check('category').isIn(['Electronics', 'Books & Documents', 'Personal Accessories', 'Clothing', 'Keys', 'ID Cards', 'Others'])
    .withMessage('Invalid category'),
  check('location').trim().notEmpty().withMessage('Location is required'),
  check('date').isISO8601().withMessage('Invalid date format'),
  check('status').isIn(['lost', 'found']).withMessage('Status must be either lost or found'),
  check('contactName').trim().notEmpty().withMessage('Contact name is required'),
  check('contactEmail').isEmail().withMessage('Invalid email address'),
  check('contactPhone').matches(/^[0-9]{10}$/).withMessage('Phone number must be 10 digits')
];

// Public routes
router.get('/statistics', lostFoundController.getStatistics);
router.get('/', lostFoundController.getItems);
router.get('/:id', lostFoundController.getItemById);

// Protected routes - require authentication
router.post('/', authMiddleware, itemValidation, lostFoundController.createItem);
router.put('/:id', authMiddleware, itemValidation, lostFoundController.updateItem);
router.delete('/:id', authMiddleware, lostFoundController.deleteItem);
router.patch('/:id/resolve', authMiddleware, lostFoundController.markResolved);

module.exports = router; 