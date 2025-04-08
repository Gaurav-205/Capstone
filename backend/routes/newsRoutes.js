const express = require('express');
const router = express.Router();
const newsController = require('../controllers/newsController');
const { isAuthenticated } = require('../middleware/auth');

// Get news statistics
router.get('/statistics', isAuthenticated, newsController.getStatistics);

// Get all news
router.get('/', isAuthenticated, newsController.getAllNews);

// Get single news by ID
router.get('/:id', isAuthenticated, newsController.getNewsById);

// Create a new news
router.post('/', isAuthenticated, newsController.createNews);

// Update a news
router.put('/:id', isAuthenticated, newsController.updateNews);

// Delete a news
router.delete('/:id', isAuthenticated, newsController.deleteNews);

module.exports = router; 