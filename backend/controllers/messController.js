const Mess = require('../models/Mess');

// Get all mess halls and canteens
exports.getAllMesses = async (req, res) => {
  try {
    const messes = await Mess.find();
    res.json(messes);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching mess halls', error: error.message });
  }
};

// Get a specific mess hall or canteen
exports.getMessById = async (req, res) => {
  try {
    const mess = await Mess.findById(req.params.id);
    if (!mess) {
      return res.status(404).json({ message: 'Mess hall not found' });
    }
    res.json(mess);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching mess hall', error: error.message });
  }
};

// Update menu for a mess hall
exports.updateMenu = async (req, res) => {
  try {
    const mess = await Mess.findById(req.params.id);
    if (!mess) {
      return res.status(404).json({ message: 'Mess hall not found' });
    }

    // Validate menu structure
    const { menu } = req.body;
    if (!Array.isArray(menu)) {
      return res.status(400).json({ message: 'Menu must be an array' });
    }

    // Validate each menu category
    for (const category of menu) {
      if (!category.category || !['Veg', 'Non-Veg', 'Jain', 'Special'].includes(category.category)) {
        return res.status(400).json({ message: 'Invalid menu category' });
      }
      if (!Array.isArray(category.items)) {
        return res.status(400).json({ message: 'Items must be an array' });
      }
      for (const item of category.items) {
        if (!item.name || typeof item.price !== 'number') {
          return res.status(400).json({ message: 'Invalid item structure' });
        }
      }
    }
    
    mess.menu = menu;
    await mess.save();
    
    res.json(mess);
  } catch (error) {
    res.status(500).json({ message: 'Error updating menu', error: error.message });
  }
};

// Add a rating and review
exports.addRating = async (req, res) => {
  try {
    const mess = await Mess.findById(req.params.id);
    if (!mess) {
      return res.status(404).json({ message: 'Mess hall not found' });
    }

    const { rating, review, photos, tags } = req.body;
    mess.ratings.push({
      userId: req.user.id,
      rating,
      review,
      photos: photos || [],
      tags: tags || []
    });

    await mess.save();
    res.json(mess);
  } catch (error) {
    res.status(500).json({ message: 'Error adding rating', error: error.message });
  }
};

// Update mess hall status (open/closed)
exports.updateStatus = async (req, res) => {
  try {
    const mess = await Mess.findById(req.params.id);
    if (!mess) {
      return res.status(404).json({ message: 'Mess hall not found' });
    }

    const { isOpen } = req.body;
    if (typeof isOpen !== 'boolean') {
      return res.status(400).json({ message: 'isOpen must be a boolean value' });
    }

    mess.isOpen = isOpen;
    await mess.save();
    
    res.json(mess);
  } catch (error) {
    res.status(500).json({ message: 'Error updating status', error: error.message });
  }
};

// Subscribe to a mess hall
exports.subscribeToMess = async (req, res) => {
  try {
    const mess = await Mess.findById(req.params.id);
    if (!mess) {
      return res.status(404).json({ message: 'Mess hall not found' });
    }

    const { startDate, endDate } = req.body;
    mess.subscriptions.push({
      userId: req.user.id,
      startDate,
      endDate,
      mealCount: 0
    });

    await mess.save();
    res.json(mess);
  } catch (error) {
    res.status(500).json({ message: 'Error subscribing to mess', error: error.message });
  }
};

// Get mess halls by filters
exports.getMessesByFilters = async (req, res) => {
  try {
    const { isOpen, type, minRating } = req.query;
    let query = {};

    if (isOpen !== undefined) {
      query.isOpen = isOpen === 'true';
    }
    if (type) {
      if (!['mess', 'canteen'].includes(type)) {
        return res.status(400).json({ message: 'Invalid mess type' });
      }
      query.type = type;
    }
    if (minRating) {
      const rating = parseFloat(minRating);
      if (isNaN(rating) || rating < 0 || rating > 5) {
        return res.status(400).json({ message: 'Invalid rating value' });
      }
      query.averageRating = { $gte: rating };
    }

    const messes = await Mess.find(query);
    res.json(messes);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching filtered mess halls', error: error.message });
  }
}; 