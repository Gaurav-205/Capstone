const News = require('../models/News');

// Get news statistics
exports.getStatistics = async (req, res) => {
  try {
    const totalNews = await News.countDocuments();
    const highPriorityNews = await News.countDocuments({ priority: 'high' });
    const recentPublished = await News.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });
    
    // Get news by category
    const categoryStats = await News.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);

    const stats = {
      total: totalNews,
      highPriority: highPriorityNews,
      recentPublished,
      categories: Object.fromEntries(categoryStats.map(stat => [stat._id, stat.count]))
    };

    res.json(stats);
  } catch (error) {
    console.error('Error getting news statistics:', error);
    res.status(500).json({ message: 'Error getting news statistics' });
  }
};

// Get all news
exports.getAllNews = async (req, res) => {
  try {
    const news = await News.find().sort({ date: -1 });
    res.json(news);
  } catch (error) {
    console.error('Error fetching news:', error);
    res.status(500).json({ message: 'Error fetching news' });
  }
};

// Get single news by ID
exports.getNewsById = async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) {
      return res.status(404).json({ message: 'News not found' });
    }
    res.json(news);
  } catch (error) {
    console.error(`Error fetching news with id ${req.params.id}:`, error);
    res.status(500).json({ message: 'Error fetching news' });
  }
};

// Create a new news
exports.createNews = async (req, res) => {
  try {
    const { 
      title, 
      content, 
      date, 
      category,
      priority,
      imageUrl
    } = req.body;

    // Validate required fields
    if (!title || !content || !date || !category) {
      return res.status(400).json({ message: 'Required fields are missing' });
    }

    const newNews = new News({
      title,
      content,
      date,
      category,
      priority: priority || 'medium',
      imageUrl,
      createdBy: req.user._id
    });

    const savedNews = await newNews.save();
    res.status(201).json(savedNews);
  } catch (error) {
    console.error('Error creating news:', error);
    res.status(500).json({ message: 'Error creating news' });
  }
};

// Update a news
exports.updateNews = async (req, res) => {
  try {
    const newsId = req.params.id;
    const updateData = req.body;

    const updatedNews = await News.findByIdAndUpdate(
      newsId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedNews) {
      return res.status(404).json({ message: 'News not found' });
    }

    res.json(updatedNews);
  } catch (error) {
    console.error(`Error updating news with id ${req.params.id}:`, error);
    res.status(500).json({ message: 'Error updating news' });
  }
};

// Delete a news
exports.deleteNews = async (req, res) => {
  try {
    const newsId = req.params.id;
    const deletedNews = await News.findByIdAndDelete(newsId);

    if (!deletedNews) {
      return res.status(404).json({ message: 'News not found' });
    }

    res.json({ message: 'News deleted successfully' });
  } catch (error) {
    console.error(`Error deleting news with id ${req.params.id}:`, error);
    res.status(500).json({ message: 'Error deleting news' });
  }
}; 