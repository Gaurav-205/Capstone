const { validationResult } = require('express-validator');
const LostFoundItem = require('../models/LostFoundItem');

// Get all items with filtering
const getItems = async (req, res) => {
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
const getItemById = async (req, res) => {
  try {
    const item = await LostFoundItem.findById(req.params.id);
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
const createItem = async (req, res) => {
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
      userId: req.user.id,
      date: date
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
const updateItem = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const item = await LostFoundItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    // Allow admins to update any item, but regular users can only update their own items
    if (req.user.role !== 'admin' && item.userId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: 'You do not have permission to update this item' });
    }

    // Validate date if provided
    if (req.body.date) {
      const date = new Date(req.body.date);
      if (isNaN(date.getTime())) {
        return res.status(400).json({ success: false, message: 'Invalid date format' });
      }
      req.body.date = date;
    }

    const updatedItem = await LostFoundItem.findByIdAndUpdate(
      req.params.id,
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
const deleteItem = async (req, res) => {
  try {
    const item = await LostFoundItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    // Allow admins to delete any item, but regular users can only delete their own items
    if (req.user.role !== 'admin' && item.userId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: 'You do not have permission to delete this item' });
    }

    await LostFoundItem.findByIdAndDelete(req.params.id);
    
    res.json({
      success: true,
      message: 'Item deleted successfully'
    });
  } catch (error) {
    console.error('Error in deleteItem:', error);
    res.status(500).json({ success: false, message: 'Server error while deleting item' });
  }
};

// Get statistics
const getStatistics = async (req, res) => {
  try {
    const [
      totalLost,
      totalFound,
      totalResolved,
      categoryStats,
      recentItems
    ] = await Promise.all([
      LostFoundItem.countDocuments({ status: 'lost' }),
      LostFoundItem.countDocuments({ status: 'found' }),
      LostFoundItem.countDocuments({ isResolved: true }),
      LostFoundItem.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ]),
      LostFoundItem.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('title status category createdAt')
    ]);

    res.json({
      success: true,
      data: {
        totalLost,
        totalFound,
        totalResolved,
        categoryStats,
        recentItems
      }
    });
  } catch (error) {
    console.error('Error in getStatistics:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching statistics' });
  }
};

// Search items
const searchItems = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({ success: false, message: 'Search query is required' });
    }

    const items = await LostFoundItem.find(
      {
        $or: [
          { title: { $regex: q, $options: 'i' } },
          { description: { $regex: q, $options: 'i' } },
          { category: { $regex: q, $options: 'i' } },
          { location: { $regex: q, $options: 'i' } }
        ]
      }
    ).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: items
    });
  } catch (error) {
    console.error('Error in searchItems:', error);
    res.status(500).json({ success: false, message: 'Server error while searching items' });
  }
};

// Mark item as resolved
const markResolved = async (req, res) => {
  try {
    const item = await LostFoundItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    // Allow admins to mark any item as resolved, but regular users can only mark their own items
    if (req.user.role !== 'admin' && item.userId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: 'You do not have permission to mark this item as resolved' });
    }

    const updatedItem = await LostFoundItem.findByIdAndUpdate(
      req.params.id,
      { 
        isResolved: true,
        updatedAt: new Date()
      },
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

// Claim item
const claimItem = async (req, res) => {
  try {
    const item = await LostFoundItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    if (item.isResolved) {
      return res.status(400).json({ success: false, message: 'This item has already been resolved' });
    }

    const updatedItem = await LostFoundItem.findByIdAndUpdate(
      req.params.id,
      {
        isResolved: true,
        claimedBy: {
          userId: req.user.id,
          name: req.user.name,
          date: new Date()
        },
        updatedAt: new Date()
      },
      { new: true }
    );
    
    res.json({
      success: true,
      data: updatedItem
    });
  } catch (error) {
    console.error('Error in claimItem:', error);
    res.status(500).json({ success: false, message: 'Server error while claiming item' });
  }
};

module.exports = {
  getItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
  getStatistics,
  searchItems,
  markResolved,
  claimItem
}; 