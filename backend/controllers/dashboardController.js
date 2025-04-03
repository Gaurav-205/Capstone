const User = require('../models/User');
const LostFound = require('../models/LostFound');
const Event = require('../models/Event');
const Hostel = require('../models/Hostel');
const Mess = require('../models/Mess');
const Feedback = require('../models/Feedback');

// Get all dashboard statistics
exports.getDashboardStats = async (req, res) => {
  try {
    // Get Lost & Found statistics
    const lostFoundStats = await LostFound.aggregate([
      {
        $group: {
          _id: null,
          totalLost: {
            $sum: { $cond: [{ $eq: ['$type', 'lost'] }, 1, 0] }
          },
          totalFound: {
            $sum: { $cond: [{ $eq: ['$type', 'found'] }, 1, 0] }
          },
          resolved: {
            $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] }
          }
        }
      }
    ]);

    // Get events statistics
    const eventsStats = await Event.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          upcoming: {
            $sum: {
              $cond: [
                { $gt: ['$date', new Date()] },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    // Get hostel occupancy
    const hostelStats = await Hostel.aggregate([
      {
        $group: {
          _id: null,
          totalRooms: { $sum: 1 },
          occupiedRooms: {
            $sum: { $cond: [{ $eq: ['$status', 'occupied'] }, 1, 0] }
          }
        }
      }
    ]);

    // Get mess attendance for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const messStats = await Mess.aggregate([
      {
        $match: {
          date: {
            $gte: today,
            $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
          }
        }
      },
      {
        $group: {
          _id: null,
          totalStudents: { $sum: 1 },
          attended: {
            $sum: { $cond: [{ $eq: ['$attended', true] }, 1, 0] }
          }
        }
      }
    ]);

    // Calculate percentages
    const stats = {
      lostAndFound: lostFoundStats[0] || { totalLost: 0, totalFound: 0, resolved: 0 },
      events: {
        total: eventsStats[0]?.total || 0,
        upcoming: eventsStats[0]?.upcoming || 0
      },
      hostel: {
        occupancy: hostelStats[0] ? 
          Math.round((hostelStats[0].occupiedRooms / hostelStats[0].totalRooms) * 100) : 0
      },
      mess: {
        attendance: messStats[0] ? 
          Math.round((messStats[0].attended / messStats[0].totalStudents) * 100) : 0
      }
    };

    res.json(stats);
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    res.status(500).json({ message: 'Error fetching dashboard statistics' });
  }
};

// Get upcoming events
exports.getUpcomingEvents = async (req, res) => {
  try {
    const events = await Event.find({
      date: { $gte: new Date() }
    })
    .sort({ date: 1 })
    .limit(3)
    .populate('attendees', 'name avatar');

    res.json({ events });
  } catch (error) {
    console.error('Error getting upcoming events:', error);
    res.status(500).json({ message: 'Error fetching upcoming events' });
  }
};

// Get pending tasks
exports.getPendingTasks = async (req, res) => {
  try {
    const tasks = await Feedback.find({
      userId: req.user._id,
      status: { $ne: 'resolved' }
    })
    .sort({ priority: -1, createdAt: 1 })
    .limit(5);

    res.json({ tasks });
  } catch (error) {
    console.error('Error getting pending tasks:', error);
    res.status(500).json({ message: 'Error fetching pending tasks' });
  }
}; 