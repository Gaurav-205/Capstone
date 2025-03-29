const Facility = require('../models/Facility');

// Get all facilities
exports.getAllFacilities = async (req, res) => {
  try {
    const facilities = await Facility.find();
    res.json(facilities);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching facilities', error: error.message });
  }
};

// Get facility by ID
exports.getFacilityById = async (req, res) => {
  try {
    const facility = await Facility.findById(req.params.id);
    if (!facility) {
      return res.status(404).json({ message: 'Facility not found' });
    }
    res.json(facility);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching facility', error: error.message });
  }
};

// Get facilities by type
exports.getFacilitiesByType = async (req, res) => {
  try {
    const facilities = await Facility.find({ type: req.params.type });
    res.json(facilities);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching facilities', error: error.message });
  }
};

// Update facility status
exports.updateFacilityStatus = async (req, res) => {
  try {
    const { isOpen } = req.body;
    const facility = await Facility.findById(req.params.id);
    
    if (!facility) {
      return res.status(404).json({ message: 'Facility not found' });
    }

    facility.isOpen = isOpen;
    await facility.save();
    
    res.json(facility);
  } catch (error) {
    res.status(500).json({ message: 'Error updating facility status', error: error.message });
  }
};

// Create new facility (admin only)
exports.createFacility = async (req, res) => {
  try {
    const facility = new Facility(req.body);
    await facility.save();
    res.status(201).json(facility);
  } catch (error) {
    res.status(500).json({ message: 'Error creating facility', error: error.message });
  }
};

// Update facility (admin only)
exports.updateFacility = async (req, res) => {
  try {
    const facility = await Facility.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!facility) {
      return res.status(404).json({ message: 'Facility not found' });
    }
    
    res.json(facility);
  } catch (error) {
    res.status(500).json({ message: 'Error updating facility', error: error.message });
  }
};

// Delete facility (admin only)
exports.deleteFacility = async (req, res) => {
  try {
    const facility = await Facility.findByIdAndDelete(req.params.id);
    
    if (!facility) {
      return res.status(404).json({ message: 'Facility not found' });
    }
    
    res.json({ message: 'Facility deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting facility', error: error.message });
  }
}; 