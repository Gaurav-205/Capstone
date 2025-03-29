const Feedback = require('../models/Feedback');
const path = require('path');

// Create new feedback
exports.createFeedback = async (req, res) => {
  try {
    const { type, category, title, description, isAnonymous, priority } = req.body;
    
    // Process attachments if any
    const attachments = req.files ? req.files.map(file => ({
      filename: file.originalname,
      url: `/uploads/${file.filename}`,
      mimetype: file.mimetype
    })) : [];
    
    const feedback = new Feedback({
      userId: req.user._id,
      type,
      category,
      title,
      description,
      isAnonymous: isAnonymous === 'true',
      priority,
      attachments,
      status: 'pending'
    });

    await feedback.save();
    res.status(201).json(feedback);
  } catch (error) {
    console.error('Error creating feedback:', error);
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        message: `Duplicate ${field} error. Please try again.`,
        field
      });
    }
    
    res.status(500).json({ message: 'Error creating feedback', error: error.message });
  }
};

// Get all feedback for a user
exports.getUserFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.find({ userId: req.user._id })
      .sort({ createdAt: -1 });
    res.json(feedback);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching feedback', error: error.message });
  }
};

// Get single feedback by ID
exports.getFeedbackById = async (req, res) => {
  try {
    const feedback = await Feedback.findOne({
      _id: req.params.id,
      userId: req.user._id
    });
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }
    res.json(feedback);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching feedback', error: error.message });
  }
};

// Update feedback
exports.updateFeedback = async (req, res) => {
  try {
    const { type, category, title, description, isAnonymous, priority } = req.body;
    
    // Find the feedback and verify ownership
    const feedback = await Feedback.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    // Process new attachments if any
    const newAttachments = req.files ? req.files.map(file => ({
      filename: file.originalname,
      url: `/uploads/${file.filename}`,
      mimetype: file.mimetype
    })) : [];

    // Update feedback fields
    feedback.type = type;
    feedback.category = category;
    feedback.title = title;
    feedback.description = description;
    feedback.isAnonymous = isAnonymous === 'true';
    feedback.priority = priority;
    
    // Add new attachments to existing ones
    if (newAttachments.length > 0) {
      feedback.attachments = [...feedback.attachments, ...newAttachments];
    }

    await feedback.save();
    res.json(feedback);
  } catch (error) {
    console.error('Error updating feedback:', error);
    res.status(500).json({ message: 'Error updating feedback', error: error.message });
  }
};

// Delete feedback
exports.deleteFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    res.json({ message: 'Feedback deleted successfully' });
  } catch (error) {
    console.error('Error deleting feedback:', error);
    res.status(500).json({ message: 'Error deleting feedback', error: error.message });
  }
};

// Update feedback status
exports.updateFeedbackStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const feedback = await Feedback.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { status },
      { new: true }
    );
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }
    res.json(feedback);
  } catch (error) {
    res.status(500).json({ message: 'Error updating feedback', error: error.message });
  }
}; 