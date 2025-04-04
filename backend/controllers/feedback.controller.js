const Feedback = require('../models/Feedback');

// Get feedback statistics
exports.getStatistics = async (req, res) => {
  try {
    const totalFeedback = await Feedback.countDocuments();
    const pendingFeedback = await Feedback.countDocuments({ status: 'pending' });
    const resolvedFeedback = await Feedback.countDocuments({ status: 'resolved' });
    const recentFeedback = await Feedback.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title status createdAt');

    res.status(200).json({
      success: true,
      data: {
        total: totalFeedback,
        pending: pendingFeedback,
        resolved: resolvedFeedback,
        recent: recentFeedback
      }
    });
  } catch (error) {
    console.error('Error getting feedback statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching feedback statistics'
    });
  }
}; 