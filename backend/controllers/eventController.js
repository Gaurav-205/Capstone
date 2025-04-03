const Event = require('../models/Event');

// Get event statistics
exports.getStatistics = async (req, res) => {
  try {
    const totalEvents = await Event.countDocuments();
    const upcomingEvents = await Event.countDocuments({ status: 'upcoming' });
    const ongoingEvents = await Event.countDocuments({ status: 'ongoing' });
    
    // Get events by category
    const categoryStats = await Event.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get registration stats
    const registrationStats = await Event.aggregate([
      {
        $project: {
          registeredCount: { $size: '$registeredParticipants' },
          capacity: 1
        }
      },
      {
        $group: {
          _id: null,
          totalRegistered: { $sum: '$registeredCount' },
          totalCapacity: { $sum: '$capacity' }
        }
      }
    ]);

    const stats = {
      total: totalEvents,
      upcoming: upcomingEvents,
      ongoing: ongoingEvents,
      categories: Object.fromEntries(categoryStats.map(stat => [stat._id, stat.count])),
      registrations: registrationStats[0] || { totalRegistered: 0, totalCapacity: 0 }
    };

    res.json(stats);
  } catch (error) {
    console.error('Error getting event statistics:', error);
    res.status(500).json({ message: 'Error getting event statistics' });
  }
}; 