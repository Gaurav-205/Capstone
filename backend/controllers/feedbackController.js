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

// Submit resolution for feedback
exports.submitResolution = async (req, res) => {
  try {
    const { description } = req.body;
    
    // Find the feedback and verify ownership
    const feedback = await Feedback.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    // Update feedback with resolution
    feedback.status = 'resolved';
    feedback.resolution = {
      description,
      resolvedBy: req.user._id,
      resolvedAt: new Date()
    };

    await feedback.save();
    res.json(feedback);
  } catch (error) {
    console.error('Error submitting resolution:', error);
    res.status(500).json({ message: 'Error submitting resolution', error: error.message });
  }
};

// Create dining feedback
exports.createDiningFeedback = async (req, res) => {
  try {
    const { 
      facilityId, 
      facilityName, 
      facilityLocation, 
      rating, 
      comment, 
      type, 
      date 
    } = req.body;

    // Validate required fields
    if (!facilityId || !facilityName || !rating || !type) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        details: 'Facility ID, facility name, rating, and type are required.'
      });
    }

    // Create new feedback with dining-specific fields
    const feedback = new Feedback({
      userId: req.user._id,
      type: 'dining',
      category: type, // 'mess' or 'canteen'
      title: `${type.charAt(0).toUpperCase() + type.slice(1)} Feedback: ${facilityName}`,
      description: comment || 'No additional comments provided.',
      isAnonymous: false,
      priority: 'medium',
      referenceNumber: `DINING-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      status: 'pending',
      metadata: {
        facilityId,
        facilityName,
        facilityLocation,
        rating,
        diningType: type,
        submittedAt: date || new Date().toISOString()
      }
    });

    await feedback.save();
    
    console.log(`Dining feedback submitted for ${facilityName} (${type}) with rating: ${rating}`);
    
    res.status(201).json({
      success: true,
      message: `Your feedback for ${facilityName} has been submitted successfully!`,
      data: feedback
    });
  } catch (error) {
    console.error('Error creating dining feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting dining feedback',
      error: error.message
    });
  }
};

// Get feedback statistics
exports.getStatistics = async (req, res) => {
  try {
    const stats = await Feedback.aggregate([
      {
        $facet: {
          'total': [{ $count: 'count' }],
          'pending': [
            { $match: { 'status': { $in: ['pending', 'in_progress'] } } },
            { $count: 'count' }
          ],
          'resolved': [
            { $match: { 'status': 'resolved' } },
            { $count: 'count' }
          ]
        }
      }
    ]);

    const result = {
      total: stats[0].total[0]?.count || 0,
      pending: stats[0].pending[0]?.count || 0,
      resolved: stats[0].resolved[0]?.count || 0
    };

    res.json({ data: result });
  } catch (error) {
    console.error('Error getting feedback statistics:', error);
    res.status(500).json({ message: 'Error fetching feedback statistics' });
  }
};

// Get facility rating (average from feedback)
exports.getFacilityRating = async (req, res) => {
  try {
    const { facilityId, type } = req.query;
    
    if (!facilityId || !type) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters',
        details: 'facilityId and type (mess or canteen) are required'
      });
    }

    // Find all dining feedback for this facility
    const feedbackEntries = await Feedback.find({
      type: 'dining',
      category: type,
      'metadata.facilityId': facilityId
    });

    if (!feedbackEntries || feedbackEntries.length === 0) {
      return res.json({
        success: true,
        data: {
          facilityId,
          type,
          averageRating: 0,
          totalReviews: 0,
          message: 'No ratings found for this facility'
        }
      });
    }

    // Calculate average rating
    const totalRating = feedbackEntries.reduce((sum, feedback) => {
      return sum + (feedback.metadata?.rating || 0);
    }, 0);

    const averageRating = (totalRating / feedbackEntries.length).toFixed(1);

    res.json({
      success: true,
      data: {
        facilityId,
        type,
        averageRating: parseFloat(averageRating),
        totalReviews: feedbackEntries.length,
        message: `Average rating calculated from ${feedbackEntries.length} reviews`
      }
    });
  } catch (error) {
    console.error('Error calculating facility rating:', error);
    res.status(500).json({
      success: false, 
      message: 'Error calculating facility rating',
      error: error.message
    });
  }
};

// Get dining feedback statistics
exports.getDiningStatistics = async (req, res) => {
  try {
    const stats = await Feedback.aggregate([
      {
        $match: { 'type': 'dining' } // Only include dining-related feedback
      },
      {
        $facet: {
          'total': [{ $count: 'count' }],
          'pending': [
            { $match: { 'status': { $in: ['pending', 'in_progress'] } } },
            { $count: 'count' }
          ],
          'resolved': [
            { $match: { 'status': 'resolved' } },
            { $count: 'count' }
          ],
          'byFacilityType': [
            {
              $group: {
                _id: '$category', // 'mess' or 'canteen'
                count: { $sum: 1 }
              }
            }
          ]
        }
      }
    ]);

    const result = {
      total: stats[0].total[0]?.count || 0,
      pending: stats[0].pending[0]?.count || 0,
      resolved: stats[0].resolved[0]?.count || 0,
      byFacilityType: Object.fromEntries(
        (stats[0].byFacilityType || []).map(item => [item._id, item.count])
      )
    };

    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error getting dining feedback statistics:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching dining feedback statistics' 
    });
  }
};

module.exports = exports; 