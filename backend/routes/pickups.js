const express = require('express');
const router = express.Router();
const Pickup = require('../models/Pickup');
const auth = require('../middleware/auth');
const { sendMail } = require('../utils/mailer');

// create pickup (auth optional, but we'll accept auth if present)
router.post('/', auth, async (req, res) => {
  try {
    const body = req.body;
    const pickup = new Pickup({
      userId: req.user ? req.user._id : null,
      name: body.name,
      phone: body.phone,
      email: body.email,
      address: body.address,
      preferredDate: body.preferredDate,
      items: body.items
    });
    await pickup.save();
    res.json(pickup);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

// list pickups (admin only)
router.get('/', auth, async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    // Only fetch pending and approved requests for admin dashboard
    const all = await Pickup.find({
      status: { $in: ['pending', 'approved'] }
    })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });
    res.json(all);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

// user can get their pickups
router.get('/me', auth, async (req, res) => {
  try {
    const list = await Pickup.find({ userId: req.user._id }).sort({
      createdAt: -1
    });
    res.json(list);
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

// update status (admin)
router.patch('/:id/status', auth, async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const pickup = await Pickup.findById(req.params.id);
    if (!pickup) return res.status(404).json({ error: 'Not found' });

    const newStatus = req.body.status;
    const validStatuses = ['pending', 'approved', 'completed', 'cancelled'];

    if (!validStatuses.includes(newStatus)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Enforce logical status flow: 
    // pending -> approved
    // approved -> completed/cancelled
    // (completed/cancelled are terminal)
    const allowedTransitions = {
      pending: ['approved'],
      approved: ['completed', 'cancelled'],
      completed: [],
      cancelled: []
    };

    if (!allowedTransitions[pickup.status].includes(newStatus)) {
      return res.status(400).json({
        error: `Invalid transition from ${pickup.status} to ${newStatus}`
      });
    }

    pickup.status = newStatus;
    await pickup.save();

    // Send email notification
    if (pickup.email) {
      let subject = 'E-Waste Pickup Request Update';
      let text = `Dear ${pickup.name},\n\nYour pickup request has been ${newStatus}.`;

      if (newStatus === 'approved') {
        text += `\n\nOur team will contact you soon to arrange the pickup.`;
      } else if (newStatus === 'completed') {
        text += `\n\nYour pickup has been completed. Thank you for using our service!`;
      } else if (newStatus === 'cancelled') {
        text += `\n\nYour pickup request has been cancelled. If this is a mistake, please contact support.`;
      }

      text += `\n\nBest regards,\nE-Waste Management Team`;
      await sendMail(pickup.email, subject, text);
    }

    res.json({ success: true, pickup });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
