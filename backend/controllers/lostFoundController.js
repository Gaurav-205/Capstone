const { validationResult } = require('express-validator');

// In-memory storage without sample data
let items = [];
let nextId = 1;

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
    let filteredItems = [...items];
    
    if (status) {
      filteredItems = filteredItems.filter(item => item.status === status);
    }
    if (category) {
      filteredItems = filteredItems.filter(item => item.category === category);
    }
    if (location) {
      filteredItems = filteredItems.filter(item => item.location === location);
    }
    if (isResolved !== undefined) {
      filteredItems = filteredItems.filter(item => item.isResolved === (isResolved === 'true'));
    }
    if (search) {
      const searchLower = search.toLowerCase();
      filteredItems = filteredItems.filter(item => 
        item.title.toLowerCase().includes(searchLower) ||
        item.description.toLowerCase().includes(searchLower)
      );
    }

    // Sort by date (newest first)
    filteredItems.sort((a, b) => b.date - a.date);

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const paginatedItems = filteredItems.slice(skip, skip + parseInt(limit));

    res.json({
      data: {
        items: paginatedItems,
        currentPage: parseInt(page),
        totalPages: Math.ceil(filteredItems.length / parseInt(limit)),
        totalItems: filteredItems.length
      }
    });
  } catch (error) {
    console.error('Error in getItems:', error);
    res.status(500).json({ message: 'Server error while fetching items' });
  }
};

// Get single item by ID
exports.getItemById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }

    const item = items.find(item => item.id === id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.json(item);
  } catch (error) {
    console.error('Error in getItemById:', error);
    res.status(500).json({ message: 'Server error while fetching item' });
  }
};

// Create new item
exports.createItem = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Validate required fields
    const requiredFields = ['title', 'description', 'category', 'location', 'date', 'status', 'contactName', 'contactEmail', 'contactPhone'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    if (missingFields.length > 0) {
      return res.status(400).json({ message: `Missing required fields: ${missingFields.join(', ')}` });
    }

    // Validate date format
    const date = new Date(req.body.date);
    if (isNaN(date.getTime())) {
      return res.status(400).json({ message: 'Invalid date format' });
    }

    const newItem = {
      id: nextId++,
      ...req.body,
      userId: req.user.id, // Add user ID from auth middleware
      date: date,
      createdAt: new Date(),
      updatedAt: new Date(),
      isResolved: false
    };
    items.push(newItem);
    res.status(201).json(newItem);
  } catch (error) {
    console.error('Error in createItem:', error);
    res.status(500).json({ message: 'Server error while creating item' });
  }
};

// Update item
exports.updateItem = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }

    const index = items.findIndex(item => item.id === id);
    if (index === -1) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Check if user owns the item
    if (items[index].userId !== req.user.id.toString()) {
      return res.status(403).json({ message: 'You are not authorized to update this item' });
    }

    // Validate date if provided
    if (req.body.date) {
      const date = new Date(req.body.date);
      if (isNaN(date.getTime())) {
        return res.status(400).json({ message: 'Invalid date format' });
      }
      req.body.date = date;
    }

    items[index] = {
      ...items[index],
      ...req.body,
      userId: req.user.id, // Preserve the original user ID
      updatedAt: new Date()
    };
    res.json(items[index]);
  } catch (error) {
    console.error('Error in updateItem:', error);
    res.status(500).json({ message: 'Server error while updating item' });
  }
};

// Delete item
exports.deleteItem = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }

    const index = items.findIndex(item => item.id === id);
    if (index === -1) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Check if user owns the item
    if (items[index].userId !== req.user.id.toString()) {
      return res.status(403).json({ message: 'You are not authorized to delete this item' });
    }

    items.splice(index, 1);
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Error in deleteItem:', error);
    res.status(500).json({ message: 'Server error while deleting item' });
  }
};

// Mark item as resolved
exports.markResolved = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }

    const index = items.findIndex(item => item.id === id);
    if (index === -1) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Check if user owns the item
    if (items[index].userId !== req.user.id.toString()) {
      return res.status(403).json({ message: 'You are not authorized to mark this item as resolved' });
    }

    items[index] = {
      ...items[index],
      isResolved: true,
      updatedAt: new Date()
    };
    res.json(items[index]);
  } catch (error) {
    console.error('Error in markResolved:', error);
    res.status(500).json({ message: 'Server error while marking item as resolved' });
  }
};

// Get statistics
exports.getStatistics = async (req, res) => {
  try {
    const stats = {
      activeLostItems: items.filter(item => item.status === 'lost' && !item.isResolved).length,
      activeFoundItems: items.filter(item => item.status === 'found' && !item.isResolved).length,
      resolvedItems: items.filter(item => item.isResolved).length,
      categoryDistribution: Object.entries(
        items.reduce((acc, item) => {
          acc[item.category] = (acc[item.category] || 0) + 1;
          return acc;
        }, {})
      ).map(([category, count]) => ({
        _id: category,
        count
      }))
    };

    res.json({ data: stats });
  } catch (error) {
    console.error('Error in getStatistics:', error);
    res.status(500).json({ message: 'Server error while fetching statistics' });
  }
}; 