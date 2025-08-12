const express = require('express');
const router = express.Router();
const Consult = require('../models/Consult');
const auth = require('../middleware/auth');
const { sendMail } = require('../utils/mailer');

// Create consult
router.post('/', auth, async (req, res) => {
  try {
    const b = req.body;
    const c = new Consult({
      userId: req.user ? req.user._id : null,
      name: b.name,
      phone: b.phone,
      email: b.email,
      category: b.category,
      description: b.description,
      preferredDate: b.preferredDate,
      mode: b.mode || 'call'
    });
    await c.save();
    res.json(c);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

// List all consults (admin/expert)
router.get('/', auth, async (req, res) => {
  try {
    if (!req.user || req.user.role === 'user') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const list = await Consult.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });
    res.json(list);
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get only active consults (admin)
router.get('/active', auth, async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const list = await Consult.find({
      status: { $in: ['pending', 'approved'] }
    }).sort({ createdAt: -1 });
    res.json(list);
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

// User's own consults
router.get('/me', auth, async (req, res) => {
  try {
    const list = await Consult.find({ userId: req.user._id }).sort({
      createdAt: -1
    });
    res.json(list);
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update consult (admin/expert)
router.patch('/:id', auth, async (req, res) => {
  try {
    if (!req.user || req.user.role === 'user') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const c = await Consult.findById(req.params.id);
    if (!c) return res.status(404).json({ error: 'Not found' });

    if (req.body.status) c.status = req.body.status;
    if (req.body.assignedExpert) c.assignedExpert = req.body.assignedExpert;
    if (req.body.notes) c.notes = req.body.notes;

    await c.save();
    res.json(c);
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update consult status (admin)
router.patch('/:id/status', auth, async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const consult = await Consult.findById(req.params.id);
    if (!consult) {
      return res.status(404).json({ error: 'Consultation not found' });
    }

    const newStatus = req.body.status;

    // Allowed transitions
    const allowedTransitions = {
      pending: ['approved'],
      approved: ['completed', 'cancelled']
    };

    if (!allowedTransitions[consult.status]?.includes(newStatus)) {
      return res.status(400).json({
        error: `Invalid status transition from ${consult.status} to ${newStatus}`
      });
    }

    consult.status = newStatus;
    await consult.save();

    // Send notification
    if (consult.email) {
      let subject = 'Consultation Status Update';
      let text = `Dear ${consult.name},\n\nYour consultation has been ${newStatus}.`;
      await sendMail(consult.email, subject, text);
    }

    res.json({
      success: true,
      consult,
      message: `Status updated to ${newStatus} successfully`
    });
  } catch (error) {
    console.error('Status update error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
