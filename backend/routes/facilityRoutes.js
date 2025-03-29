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
  deleteFacility
} = require('../controllers/facilityController');

// Public routes
router.get('/', getAllFacilities);
router.get('/:id', getFacilityById);
router.get('/type/:type', getFacilitiesByType);

// Protected routes (require authentication)
router.put('/:id/status', isAuthenticated, updateFacilityStatus);

// Admin routes
router.post('/', isAuthenticated, isAdmin, createFacility);
router.put('/:id', isAuthenticated, isAdmin, updateFacility);
router.delete('/:id', isAuthenticated, isAdmin, deleteFacility);

module.exports = router; 