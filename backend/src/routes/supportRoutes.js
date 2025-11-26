const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth.middleware');
const SupportTicket = require('../models/SupportTicket');

// Create a new support ticket
router.post('/tickets', authMiddleware, async (req, res) => {
  try {
    const { orderId, category, subject, description, priority } = req.body;

    if (!category || !subject || !description) {
      return res.status(400).json({
        success: false,
        message: 'Category, subject, and description are required'
      });
    }

    const ticket = await SupportTicket.create({
      userId: req.user._id,
      orderId: orderId || undefined,
      category,
      priority: priority || 'medium',
      subject,
      description,
      messages: [{
        senderId: req.user._id,
        senderRole: 'customer',
        message: description
      }]
    });

    await ticket.populate('userId', 'name email');

    res.status(201).json({
      success: true,
      data: ticket,
      message: 'Support ticket created successfully'
    });
  } catch (error) {
    console.error('Error creating support ticket:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get all tickets for logged-in user
router.get('/tickets', authMiddleware, async (req, res) => {
  try {
    const { status, category } = req.query;
    const query = { userId: req.user._id };

    if (status) query.status = status;
    if (category) query.category = category;

    const tickets = await SupportTicket.find(query)
      .populate('orderId', 'orderNumber')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: tickets
    });
  } catch (error) {
    console.error('Error fetching tickets:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get single ticket by ID
router.get('/tickets/:id', authMiddleware, async (req, res) => {
  try {
    const ticket = await SupportTicket.findById(req.params.id)
      .populate('userId', 'name email')
      .populate('orderId', 'orderNumber')
      .populate('messages.senderId', 'name');

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    // Check if user owns the ticket or is admin
    if (ticket.userId._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    res.json({
      success: true,
      data: ticket
    });
  } catch (error) {
    console.error('Error fetching ticket:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Add message to ticket
router.post('/tickets/:id/messages', authMiddleware, async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    const ticket = await SupportTicket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    // Check if user owns the ticket or is admin
    if (ticket.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    ticket.messages.push({
      senderId: req.user._id,
      senderRole: req.user.role === 'admin' ? 'admin' : 'customer',
      message: message.trim()
    });

    // Update status if it was closed
    if (ticket.status === 'closed') {
      ticket.status = 'open';
    }

    await ticket.save();
    await ticket.populate('messages.senderId', 'name');

    res.json({
      success: true,
      data: ticket,
      message: 'Message added successfully'
    });
  } catch (error) {
    console.error('Error adding message:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Close ticket
router.patch('/tickets/:id/close', authMiddleware, async (req, res) => {
  try {
    const ticket = await SupportTicket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    // Check if user owns the ticket
    if (ticket.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    ticket.status = 'closed';
    await ticket.save();

    res.json({
      success: true,
      data: ticket,
      message: 'Ticket closed successfully'
    });
  } catch (error) {
    console.error('Error closing ticket:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Rate ticket resolution
router.post('/tickets/:id/rate', authMiddleware, async (req, res) => {
  try {
    const { rating } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    const ticket = await SupportTicket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    // Check if user owns the ticket
    if (ticket.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    if (!ticket.resolution) {
      ticket.resolution = {};
    }

    ticket.resolution.customerSatisfaction = rating;
    await ticket.save();

    res.json({
      success: true,
      data: ticket,
      message: 'Thank you for your feedback'
    });
  } catch (error) {
    console.error('Error rating ticket:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
