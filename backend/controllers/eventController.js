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

// Get all events
exports.getAllEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ date: -1 });
    res.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ message: 'Error fetching events' });
  }
};

// Get single event by ID
exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.json(event);
  } catch (error) {
    console.error(`Error fetching event with id ${req.params.id}:`, error);
    res.status(500).json({ message: 'Error fetching event' });
  }
};

// Create a new event
exports.createEvent = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      date, 
      time, 
      location, 
      type, 
      imageUrl, 
      registrationUrl,
      startDate,
      endDate,
      startTime,
      endTime,
      isMultiDay
    } = req.body;

    // Validate required fields
    if (!title || !description || !date || !location || !type) {
      return res.status(400).json({ message: 'Required fields are missing' });
    }

    const newEvent = new Event({
      title,
      description,
      date,
      time,
      location,
      type,
      imageUrl,
      registrationUrl,
      startDate: startDate || date,
      endDate: endDate || date,
      startTime: startTime || time,
      endTime: endTime || time,
      isMultiDay: isMultiDay || false,
      createdBy: req.user._id
    });

    const savedEvent = await newEvent.save();
    res.status(201).json(savedEvent);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ message: 'Error creating event' });
  }
};

// Update an event
exports.updateEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const updateData = req.body;

    const updatedEvent = await Event.findByIdAndUpdate(
      eventId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedEvent) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json(updatedEvent);
  } catch (error) {
    console.error(`Error updating event with id ${req.params.id}:`, error);
    res.status(500).json({ message: 'Error updating event' });
  }
};

// Delete an event
exports.deleteEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const deletedEvent = await Event.findByIdAndDelete(eventId);

    if (!deletedEvent) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error(`Error deleting event with id ${req.params.id}:`, error);
    res.status(500).json({ message: 'Error deleting event' });
  }
}; 