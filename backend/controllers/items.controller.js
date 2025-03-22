const Item = require('../models/Item');

// Get all items
exports.getAllItems = async (req, res) => {
  try {
    const items = await Item.find()
      .populate('postedBy', 'name email')
      .populate('claimedBy', 'name email')
      .sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single item by ID
exports.getItemById = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Item.findById(id)
      .populate('postedBy', 'name email')
      .populate('claimedBy', 'name email');
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get items by category
exports.getItemsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const items = await Item.find({ category })
      .populate('postedBy', 'name email')
      .populate('claimedBy', 'name email')
      .sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new item
exports.createItem = async (req, res) => {
  try {
    const item = new Item({
      ...req.body,
      postedBy: req.user._id
    });
    const newItem = await item.save();
    res.status(201).json(newItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update item status
exports.updateItemStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // Validate status
    if (!['active', 'resolved', 'claimed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    // First find the item and check if it exists
    const item = await Item.findById(id)
      .populate('postedBy', 'name email')
      .populate('claimedBy', 'name email');
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Check if item is already claimed
    if (status === 'claimed' && item.status === 'claimed') {
      return res.status(400).json({ message: 'This item has already been claimed' });
    }

    // For non-claim status updates, only the owner can update
    if (status !== 'claimed' && item.postedBy._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only update your own items' });
    }

    // Update the item status
    item.status = status;
    
    // If claiming, set the claimedBy field
    if (status === 'claimed') {
      item.claimedBy = req.user._id;
    } else {
      // If changing back to active or resolved, remove claimedBy
      item.claimedBy = undefined;
    }
    
    // Save the item
    await item.save();

    // Fetch the updated item with populated fields
    const updatedItem = await Item.findById(id)
      .populate('postedBy', 'name email')
      .populate('claimedBy', 'name email');

    res.json(updatedItem);
  } catch (error) {
    console.error('Update item status error:', error);
    res.status(400).json({ message: error.message });
  }
};

// Delete item
exports.deleteItem = async (req, res) => {
  try {
    const { id } = req.params;
    
    // First find the item to check ownership
    const item = await Item.findById(id);
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Check if the user is the owner of the item
    if (item.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this item' });
    }

    // Delete the item
    await Item.findByIdAndDelete(id);
    
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Delete item error:', error);
    res.status(500).json({ message: error.message });
  }
}; 