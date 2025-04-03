const express = require('express');
const router = express.Router();
const { isAuthenticated, isAdmin } = require('../middleware/auth');
const {
  getAllFacilities,
  getFacilityById,
  getFacilitiesByType,
  updateFacilityStatus,
  createFacility,
  updateFacility,
  deleteFacility,
  getStatistics
} = require('../controllers/facilityController');

// Get facility statistics (must be before parameterized routes)
router.get('/statistics', isAuthenticated, getStatistics);

// Public routes
router.get('/', getAllFacilities);
router.get('/type/:type', getFacilitiesByType);
router.get('/:id', getFacilityById);

// Protected routes (require authentication)
router.put('/:id/status', isAuthenticated, updateFacilityStatus);

// Admin routes
router.post('/', isAuthenticated, isAdmin, createFacility);
router.put('/:id', isAuthenticated, isAdmin, updateFacility);
router.delete('/:id', isAuthenticated, isAdmin, deleteFacility);

module.exports = router; 