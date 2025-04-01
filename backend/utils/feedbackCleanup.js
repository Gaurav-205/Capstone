const Feedback = require('../models/Feedback');

const cleanupFeedback = async () => {
  const now = new Date();
  console.log('Starting feedback cleanup at:', now);

  try {
    // Close feedback items that have passed their scheduled close date
    const closeResult = await Feedback.updateMany(
      {
        status: 'resolved',
        scheduledCloseDate: { $lte: now }
      },
      {
        $set: { status: 'closed' }
      }
    );

    // Delete feedback items that have passed their scheduled deletion date
    const deleteResult = await Feedback.deleteMany({
      scheduledDeletionDate: { $lte: now }
    });

    console.log('Feedback cleanup completed:', {
      closed: closeResult.modifiedCount,
      deleted: deleteResult.deletedCount,
      timestamp: new Date()
    });

    return {
      success: true,
      closed: closeResult.modifiedCount,
      deleted: deleteResult.deletedCount
    };
  } catch (error) {
    console.error('Error during feedback cleanup:', {
      error: error.message,
      stack: error.stack,
      timestamp: new Date()
    });

    return {
      success: false,
      error: error.message
    };
  }
};

// Export both the cleanup function and a wrapped version that won't throw
module.exports = cleanupFeedback;
module.exports.safeCleanup = async () => {
  try {
    return await cleanupFeedback();
  } catch (error) {
    console.error('Critical error in feedback cleanup:', error);
    return {
      success: false,
      error: 'Critical error in cleanup process'
    };
  }
}; 