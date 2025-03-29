const Hostel = require('../models/Hostel');

// Get all hostels
exports.getAllHostels = async (req, res) => {
  try {
    const hostels = await Hostel.find();
    res.json(hostels);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching hostels', error: error.message });
  }
};

// Get hostel by ID
exports.getHostelById = async (req, res) => {
  try {
    const hostel = await Hostel.findById(req.params.id);
    if (!hostel) {
      return res.status(404).json({ message: 'Hostel not found' });
    }
    res.json(hostel);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching hostel', error: error.message });
  }
};

// Get hostels by type
exports.getHostelsByType = async (req, res) => {
  try {
    const hostels = await Hostel.find({ type: req.params.type });
    res.json(hostels);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching hostels', error: error.message });
  }
};

// Update room availability
exports.updateRoomAvailability = async (req, res) => {
  try {
    const { occupiedRooms } = req.body;
    const hostel = await Hostel.findById(req.params.id);
    
    if (!hostel) {
      return res.status(404).json({ message: 'Hostel not found' });
    }

    if (occupiedRooms > hostel.totalRooms) {
      return res.status(400).json({ message: 'Occupied rooms cannot exceed total rooms' });
    }

    hostel.occupiedRooms = occupiedRooms;
    await hostel.save();
    
    res.json(hostel);
  } catch (error) {
    res.status(500).json({ message: 'Error updating room availability', error: error.message });
  }
};

// Create new hostel (admin only)
exports.createHostel = async (req, res) => {
  try {
    const hostel = new Hostel(req.body);
    await hostel.save();
    res.status(201).json(hostel);
  } catch (error) {
    res.status(500).json({ message: 'Error creating hostel', error: error.message });
  }
};

// Update hostel (admin only)
exports.updateHostel = async (req, res) => {
  try {
    const hostel = await Hostel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!hostel) {
      return res.status(404).json({ message: 'Hostel not found' });
    }
    
    res.json(hostel);
  } catch (error) {
    res.status(500).json({ message: 'Error updating hostel', error: error.message });
  }
};

// Delete hostel (admin only)
exports.deleteHostel = async (req, res) => {
  try {
    const hostel = await Hostel.findByIdAndDelete(req.params.id);
    
    if (!hostel) {
      return res.status(404).json({ message: 'Hostel not found' });
    }
    
    res.json({ message: 'Hostel deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting hostel', error: error.message });
  }
}; 