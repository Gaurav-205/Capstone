const { Support, FAQ } = require('../models/Support');
const { validationResult } = require('express-validator');

// Create new support ticket
exports.createTicket = async (req, res) => {
  try {
    const { title, description, category } = req.body;
    
    // Process attachments if any
    const attachments = req.files ? req.files.map(file => ({
      filename: file.originalname,
      url: `/uploads/${file.filename}`,
      mimetype: file.mimetype
    })) : [];
    
    const supportTicket = new Support({
      userId: req.user._id,
      title,
      description,
      category,
      attachments,
      status: 'open'
    });

    await supportTicket.save();
    res.status(201).json({
      success: true,
      data: supportTicket
    });
  } catch (error) {
    console.error('Error creating support ticket:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error creating support ticket', 
      error: error.message 
    });
  }
};

// Get all tickets for a user
exports.getUserTickets = async (req, res) => {
  try {
    const tickets = await Support.find({ userId: req.user._id })
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: tickets
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching support tickets', 
      error: error.message 
    });
  }
};

// Get all FAQs
exports.getAllFAQs = async (req, res) => {
  try {
    const { category } = req.query;
    
    // Build filter
    const filter = { isActive: true };
    if (category) filter.category = category;
    
    const faqs = await FAQ.find(filter)
      .sort({ order: 1, createdAt: -1 });
    
    res.json({
      success: true,
      data: faqs
    });
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching FAQs', 
      error: error.message 
    });
  }
};

// Create a new FAQ (admin only)
exports.createFAQ = async (req, res) => {
  try {
    // Check if admin
    if (!req.user.isAdmin) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Admin privileges required.' 
      });
    }
    
    const { question, answer, category, order } = req.body;
    
    const faq = new FAQ({
      question,
      answer,
      category,
      order: order || 0
    });
    
    await faq.save();
    
    res.status(201).json({
      success: true,
      data: faq
    });
  } catch (error) {
    console.error('Error creating FAQ:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error creating FAQ', 
      error: error.message 
    });
  }
};

// Get all tickets (admin only)
exports.getAllTickets = async (req, res) => {
  try {
    // Check if admin (You'll need to adapt this based on your auth system)
    if (!req.user.isAdmin) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Admin privileges required.' 
      });
    }

    const { status, category, page = 1, limit = 10 } = req.query;
    
    // Build filter object
    const filter = {};
    
    if (status) filter.status = status;
    if (category) filter.category = category;
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [tickets, totalTickets] = await Promise.all([
      Support.find(filter)
        .populate('userId', 'name email')
        .populate('assignedTo', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Support.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(totalTickets / parseInt(limit));

    res.json({
      success: true,
      data: {
        tickets,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: totalTickets,
          perPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching support tickets', 
      error: error.message 
    });
  }
};

// Get single ticket by ID
exports.getTicketById = async (req, res) => {
  try {
    const ticket = await Support.findById(req.params.id)
      .populate('userId', 'name email')
      .populate('assignedTo', 'name email')
      .populate('resolution.resolvedBy', 'name email');
    
    if (!ticket) {
      return res.status(404).json({ 
        success: false, 
        message: 'Support ticket not found' 
      });
    }
    
    // Check if user owns the ticket or is admin
    if (ticket.userId._id.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. You do not have permission to view this ticket.' 
      });
    }
    
    res.json({
      success: true,
      data: ticket
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching support ticket', 
      error: error.message 
    });
  }
};

// Update ticket
exports.updateTicket = async (req, res) => {
  try {
    const { title, description, category } = req.body;
    
    // Find the ticket
    const ticket = await Support.findById(req.params.id);
    
    if (!ticket) {
      return res.status(404).json({ 
        success: false, 
        message: 'Support ticket not found' 
      });
    }
    
    // Check if user owns the ticket or is admin
    if (ticket.userId.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. You do not have permission to update this ticket.' 
      });
    }
    
    // Process new attachments if any
    const newAttachments = req.files ? req.files.map(file => ({
      filename: file.originalname,
      url: `/uploads/${file.filename}`,
      mimetype: file.mimetype
    })) : [];
    
    // Update ticket fields
    if (title) ticket.title = title;
    if (description) ticket.description = description;
    if (category) ticket.category = category;
    
    // Add new attachments to existing ones
    if (newAttachments.length > 0) {
      ticket.attachments = [...ticket.attachments, ...newAttachments];
    }
    
    await ticket.save();
    
    res.json({
      success: true,
      data: ticket
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error updating support ticket', 
      error: error.message 
    });
  }
};

// Update ticket status (admin only)
exports.updateTicketStatus = async (req, res) => {
  try {
    const { status, assignedTo, expectedResolutionDate } = req.body;
    
    // Check if admin
    if (!req.user.isAdmin) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Admin privileges required.' 
      });
    }
    
    const ticket = await Support.findById(req.params.id);
    
    if (!ticket) {
      return res.status(404).json({ 
        success: false, 
        message: 'Support ticket not found' 
      });
    }
    
    // Update fields
    if (status) ticket.status = status;
    if (assignedTo) ticket.assignedTo = assignedTo;
    if (expectedResolutionDate) ticket.expectedResolutionDate = new Date(expectedResolutionDate);
    
    await ticket.save();
    
    res.json({
      success: true,
      data: ticket
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error updating ticket status', 
      error: error.message 
    });
  }
};

// Submit resolution (admin only)
exports.submitResolution = async (req, res) => {
  try {
    const { description } = req.body;
    
    // Check if admin
    if (!req.user.isAdmin) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Admin privileges required.' 
      });
    }
    
    const ticket = await Support.findById(req.params.id);
    
    if (!ticket) {
      return res.status(404).json({ 
        success: false, 
        message: 'Support ticket not found' 
      });
    }
    
    // Update resolution
    ticket.resolution = {
      description,
      resolvedBy: req.user._id,
      resolvedAt: new Date()
    };
    
    // Update status to resolved
    ticket.status = 'resolved';
    
    await ticket.save();
    
    res.json({
      success: true,
      data: ticket
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error submitting resolution', 
      error: error.message 
    });
  }
};

// Rate resolution
exports.rateResolution = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    
    const ticket = await Support.findById(req.params.id);
    
    if (!ticket) {
      return res.status(404).json({ 
        success: false, 
        message: 'Support ticket not found' 
      });
    }
    
    // Check if user owns the ticket
    if (ticket.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. You do not have permission to rate this ticket.' 
      });
    }
    
    // Check if ticket is resolved
    if (ticket.status !== 'resolved') {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot rate a ticket that has not been resolved.' 
      });
    }
    
    // Update user rating
    ticket.userRating = {
      rating,
      comment
    };
    
    // Update status to closed
    ticket.status = 'closed';
    
    await ticket.save();
    
    res.json({
      success: true,
      data: ticket
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error rating resolution', 
      error: error.message 
    });
  }
};

// Delete ticket
exports.deleteTicket = async (req, res) => {
  try {
    const ticket = await Support.findById(req.params.id);
    
    if (!ticket) {
      return res.status(404).json({ 
        success: false, 
        message: 'Support ticket not found' 
      });
    }
    
    // Check if user owns the ticket or is admin
    if (ticket.userId.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. You do not have permission to delete this ticket.' 
      });
    }
    
    await Support.deleteOne({ _id: req.params.id });
    
    res.json({
      success: true,
      message: 'Support ticket deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting support ticket', 
      error: error.message 
    });
  }
};

// Get support statistics
exports.getStatistics = async (req, res) => {
  try {
    // Check if admin
    if (!req.user.isAdmin) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Admin privileges required.' 
      });
    }
    
    const [
      totalTickets,
      openTickets,
      inProgressTickets,
      resolvedTickets,
      closedTickets,
      categoryCounts,
      averageResolutionTime
    ] = await Promise.all([
      Support.countDocuments(),
      Support.countDocuments({ status: 'open' }),
      Support.countDocuments({ status: 'in_progress' }),
      Support.countDocuments({ status: 'resolved' }),
      Support.countDocuments({ status: 'closed' }),
      Support.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Support.aggregate([
        { $match: { 'resolution.resolvedAt': { $exists: true } } },
        { $project: {
            resolutionTime: { 
              $subtract: ['$resolution.resolvedAt', '$createdAt'] 
            }
          }
        },
        { $group: {
            _id: null,
            averageTime: { $avg: '$resolutionTime' }
          }
        }
      ])
    ]);
    
    const avgTime = averageResolutionTime.length > 0 
      ? Math.round(averageResolutionTime[0].averageTime / (1000 * 60 * 60 * 24)) // Convert to days
      : 0;
    
    const categoryStats = categoryCounts.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {});
    
    res.json({
      success: true,
      data: {
        total: totalTickets,
        open: openTickets,
        inProgress: inProgressTickets,
        resolved: resolvedTickets,
        closed: closedTickets,
        categories: categoryStats,
        averageResolutionDays: avgTime
      }
    });
  } catch (error) {
    console.error('Error getting support statistics:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error getting support statistics', 
      error: error.message 
    });
  }
}; 