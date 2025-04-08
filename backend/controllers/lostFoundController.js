const { validationResult } = require('express-validator');
const LostFoundItem = require('../models/LostFoundItem');

// Get all items with filtering
exports.getItems = async (req, res) => {
  try {
    const {
      status,
      category,
      location,
      isResolved,
      search,
      page = 1,
      limit = 10
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (status) {
      filter.status = status;
    }
    if (category) {
      filter.category = category;
    }
    if (location) {
      filter.location = location;
    }
    if (isResolved !== undefined) {
      filter.isResolved = isResolved === 'true';
    }
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Find items with filters, sort, and paginate
    const [items, totalItems] = await Promise.all([
      LostFoundItem.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      LostFoundItem.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(totalItems / parseInt(limit));

    res.json({
      success: true,
      data: {
        items,
        currentPage: parseInt(page),
        totalPages,
        totalItems
      }
    });
  } catch (error) {
    console.error('Error in getItems:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching items' });
  }
};

// Get single item by ID
exports.getItemById = async (req, res) => {
  try {
    const id = req.params.id;

    const item = await LostFoundItem.findById(id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }
    
    res.json({
      success: true,
      data: item
    });
  } catch (error) {
    console.error('Error in getItemById:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching item' });
  }
};

// Create new item
exports.createItem = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    // Validate required fields
    const requiredFields = ['title', 'description', 'category', 'location', 'date', 'status', 'contactName', 'contactEmail', 'contactPhone'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    if (missingFields.length > 0) {
      return res.status(400).json({ success: false, message: `Missing required fields: ${missingFields.join(', ')}` });
    }

    // Validate date format
    const date = new Date(req.body.date);
    if (isNaN(date.getTime())) {
      return res.status(400).json({ success: false, message: 'Invalid date format' });
    }

    // Create new lost/found item
    const newItem = new LostFoundItem({
      ...req.body,
      userId: req.user.id, // Add user ID from auth middleware
      date: date,
    });

    // Save to database
    await newItem.save();
    
    res.status(201).json({
      success: true,
      data: newItem
    });
  } catch (error) {
    console.error('Error in createItem:', error);
    res.status(500).json({ success: false, message: 'Server error while creating item' });
  }
};

// Update item
exports.updateItem = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const id = req.params.id;

    // Find the item
    const item = await LostFoundItem.findById(id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    // Check if user owns the item
    if (item.userId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: 'You are not authorized to update this item' });
    }

    // Validate date if provided
    if (req.body.date) {
      const date = new Date(req.body.date);
      if (isNaN(date.getTime())) {
        return res.status(400).json({ success: false, message: 'Invalid date format' });
      }
      req.body.date = date;
    }

    // Update the item
    const updatedItem = await LostFoundItem.findByIdAndUpdate(
      id,
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    
    res.json({
      success: true,
      data: updatedItem
    });
  } catch (error) {
    console.error('Error in updateItem:', error);
    res.status(500).json({ success: false, message: 'Server error while updating item' });
  }
};

// Delete item
exports.deleteItem = async (req, res) => {
  try {
    const id = req.params.id;

    // Find the item
    const item = await LostFoundItem.findById(id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    // Check if user owns the item
    if (item.userId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: 'You are not authorized to delete this item' });
    }

    // Delete the item
    await LostFoundItem.findByIdAndDelete(id);
    
    res.json({
      success: true,
      message: 'Item deleted successfully'
    });
  } catch (error) {
    console.error('Error in deleteItem:', error);
    res.status(500).json({ success: false, message: 'Server error while deleting item' });
  }
};

// Mark item as resolved
exports.markResolved = async (req, res) => {
  try {
    const id = req.params.id;

    // Find the item
    const item = await LostFoundItem.findById(id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    // Check if user owns the item
    if (item.userId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: 'You are not authorized to mark this item as resolved' });
    }

    // Update the item
    const updatedItem = await LostFoundItem.findByIdAndUpdate(
      id,
      { isResolved: true, updatedAt: new Date() },
      { new: true }
    );
    
    res.json({
      success: true,
      data: updatedItem
    });
  } catch (error) {
    console.error('Error in markResolved:', error);
    res.status(500).json({ success: false, message: 'Server error while marking item as resolved' });
  }
};

// Get statistics
exports.getStatistics = async (req, res) => {
  try {
    const [activeLostItems, activeFoundItems, resolvedItems, categoryDistribution] = await Promise.all([
      LostFoundItem.countDocuments({ status: 'lost', isResolved: false }),
      LostFoundItem.countDocuments({ status: 'found', isResolved: false }),
      LostFoundItem.countDocuments({ isResolved: true }),
      LostFoundItem.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ])
    ]);

    const stats = {
      activeLostItems,
      activeFoundItems,
      resolvedItems,
      categoryDistribution
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error in getStatistics:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching statistics' });
  }
}; 