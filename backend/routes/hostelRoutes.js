const express = require('express');
const router = express.Router();
const { isAuthenticated, isAdmin } = require('../middleware/auth');
const {
  getAllHostels,
  getHostelById,
  getHostelsByType,
  updateRoomAvailability,
  createHostel,
  updateHostel,
  deleteHostel
} = require('../controllers/hostelController');

// Public routes
router.get('/', getAllHostels);
router.get('/:id', getHostelById);
router.get('/type/:type', getHostelsByType);

// Protected routes (require authentication)
router.put('/:id/availability', isAuthenticated, updateRoomAvailability);

// Admin routes
router.post('/', isAuthenticated, isAdmin, createHostel);
router.put('/:id', isAuthenticated, isAdmin, updateHostel);
router.delete('/:id', isAuthenticated, isAdmin, deleteHostel);

module.exports = router; 