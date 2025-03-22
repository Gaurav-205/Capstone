const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');
const {
  getAllItems,
  getItemById,
  getItemsByCategory,
  createItem,
  updateItemStatus,
  deleteItem
} = require('../controllers/items.controller');

// Get all items
router.get('/', getAllItems);

// Get items by category (lost/found)
router.get('/category/:category', getItemsByCategory);

// Get single item by ID
router.get('/:id', getItemById);

// Create new item (requires authentication)
router.post('/', isAuthenticated, createItem);

// Update item status (requires authentication)
router.patch('/:id/status', isAuthenticated, updateItemStatus);

// Delete item (requires authentication)
router.delete('/:id', isAuthenticated, deleteItem);

module.exports = router; 