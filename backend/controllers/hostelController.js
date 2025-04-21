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
    console.log('Create Hostel - Request received');
    console.log('Headers:', {
      authorization: req.headers.authorization ? 'Bearer [token]' : 'none',
      'content-type': req.headers['content-type']
    });
    console.log('Request body:', JSON.stringify(req.body, null, 2));

    // Check if user exists and is admin
    if (!req.user) {
      console.log('Create Hostel - No user found');
      return res.status(401).json({
        message: 'Authentication required',
        code: 'NO_USER'
      });
    }

    if (req.user.role !== 'admin') {
      console.log('Create Hostel - Non-admin access attempt:', {
        userId: req.user._id,
        role: req.user.role
      });
      return res.status(403).json({
        message: 'Admin access required',
        code: 'NOT_ADMIN'
      });
    }

    // Validate required fields
    const requiredFields = [
      'name', 
      'type', 
      'totalRooms',
      'location.building',
      'location.floor',
      'contactInfo.warden.name',
      'contactInfo.warden.phone',
      'contactInfo.warden.email',
      'contactInfo.admin.name',
      'contactInfo.admin.phone',
      'contactInfo.admin.email'
    ];

    const missingFields = [];
    requiredFields.forEach(field => {
      const value = field.split('.').reduce((obj, key) => obj?.[key], req.body);
      if (!value) missingFields.push(field);
    });
    
    if (missingFields.length > 0) {
      console.log('Create Hostel - Missing required fields:', missingFields);
      return res.status(400).json({
        message: 'Missing required fields',
        fields: missingFields,
        code: 'MISSING_FIELDS'
      });
    }

    // Validate type field
    if (!['Boys', 'Girls', 'PG'].includes(req.body.type)) {
      console.log('Create Hostel - Invalid type:', req.body.type);
      return res.status(400).json({
        message: 'Invalid hostel type',
        validTypes: ['Boys', 'Girls', 'PG'],
        received: req.body.type,
        code: 'INVALID_TYPE'
      });
    }

    // Validate totalRooms and occupiedRooms
    if (req.body.totalRooms < 1) {
      console.log('Create Hostel - Invalid totalRooms:', req.body.totalRooms);
      return res.status(400).json({
        message: 'Total rooms must be at least 1',
        received: req.body.totalRooms,
        code: 'INVALID_ROOMS'
      });
    }

    if (req.body.occupiedRooms && req.body.occupiedRooms > req.body.totalRooms) {
      console.log('Create Hostel - Invalid occupiedRooms:', req.body.occupiedRooms);
      return res.status(400).json({
        message: 'Occupied rooms cannot exceed total rooms',
        received: req.body.occupiedRooms,
        totalRooms: req.body.totalRooms,
        code: 'INVALID_OCCUPIED_ROOMS'
      });
    }

    // Validate phone numbers
    const phoneRegex = /^\+?[1-9]\d{9,14}$/;
    const phones = [
      { value: req.body.contactInfo?.warden?.phone, field: 'warden.phone' },
      { value: req.body.contactInfo?.admin?.phone, field: 'admin.phone' }
    ];

    const invalidPhones = phones.filter(({ value }) => !phoneRegex.test(value));
    if (invalidPhones.length > 0) {
      return res.status(400).json({
        message: 'Invalid phone number format',
        fields: invalidPhones.map(p => p.field),
        code: 'INVALID_PHONE'
      });
    }

    // Validate email addresses
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const emails = [
      { value: req.body.contactInfo?.warden?.email, field: 'warden.email' },
      { value: req.body.contactInfo?.admin?.email, field: 'admin.email' }
    ];

    const invalidEmails = emails.filter(({ value }) => !emailRegex.test(value));
    if (invalidEmails.length > 0) {
      return res.status(400).json({
        message: 'Invalid email format',
        fields: invalidEmails.map(e => e.field),
        code: 'INVALID_EMAIL'
      });
    }

    // Set default values and structure the data
    const hostelData = {
      ...req.body,
      occupiedRooms: req.body.occupiedRooms || 0,
      ratings: {
        cleanliness: 0,
        food: 0,
        security: 0,
        maintenance: 0,
        overall: 0,
        ...req.body.ratings
      },
      fees: {
        monthly: req.body.fees?.monthly || 0,
        security: req.body.fees?.security || 0,
        mess: req.body.fees?.mess || 0
      },
      amenities: {
        wifi: false,
        laundry: false,
        mess: false,
        sports: false,
        security: false,
        cleaning: false,
        transport: false,
        parking: false,
        medical: false,
        library: false,
        computer: false,
        ...req.body.amenities
      },
      facilities: req.body.facilities || [],
      rules: req.body.rules || [],
      images: req.body.images || []
    };

    console.log('Create Hostel - Processed data:', JSON.stringify(hostelData, null, 2));

    const hostel = new Hostel(hostelData);
    await hostel.save();

    console.log('Create Hostel - Success:', {
      id: hostel._id,
      name: hostel.name,
      type: hostel.type
    });

    res.status(201).json(hostel);
  } catch (error) {
    console.error('Create Hostel - Error:', error);
    console.error('Stack trace:', error.stack);

    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));
      
      return res.status(400).json({
        message: 'Validation error',
        errors: validationErrors,
        code: 'VALIDATION_ERROR'
      });
    }

    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        message: 'Duplicate entry',
        field: field,
        code: 'DUPLICATE_ENTRY'
      });
    }

    res.status(500).json({
      message: 'Failed to create hostel',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      code: 'SERVER_ERROR'
    });
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
    console.error('Error updating hostel:', error);
    res.status(500).json({ 
      message: 'Error updating hostel', 
      error: error.message,
      details: error.errors 
    });
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