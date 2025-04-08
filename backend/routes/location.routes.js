const express = require('express');
const router = express.Router();
const { locations } = require('../data/locations');
const auth = require('../middleware/auth');

/**
 * @route   GET /api/locations
 * @desc    Get all locations from the map
 * @access  Public
 */
router.get('/', (req, res) => {
  try {
    // Return only the essential information needed for autocomplete
    const locationData = locations.map((location) => ({
      id: location.id,
      name: location.name,
      type: location.type,
      coordinates: location.coordinates
    }));
    
    res.json(locationData);
  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/locations/:id
 * @desc    Get location by ID
 * @access  Public
 */
router.get('/:id', (req, res) => {
  try {
    const location = locations.find(loc => loc.id === req.params.id);
    
    if (!location) {
      return res.status(404).json({ message: 'Location not found' });
    }
    
    res.json(location);
  } catch (error) {
    console.error('Error fetching location:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 