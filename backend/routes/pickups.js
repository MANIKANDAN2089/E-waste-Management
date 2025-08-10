const express = require('express');
const router = express.Router();
const Pickup = require('../models/Pickup');
const auth = require('../middleware/auth');

// create pickup (auth optional, but we'll accept auth if present)
router.post('/', auth, async (req,res) => {
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
  } catch(e) { console.error(e); res.status(500).json({error:'Server error'}); }
});

// list pickups (admin only simplified: check role)
router.get('/', auth, async (req,res) => {
  try {
    if (!req.user || req.user.role === 'user') return res.status(403).json({ error: 'Forbidden' });
    const all = await Pickup.find().populate('userId','name email').sort({createdAt:-1});
    res.json(all);
  } catch(e){ console.error(e); res.status(500).json({error:'Server error'}); }
});

// user can get their pickups
router.get('/me', auth, async (req,res)=>{
  try {
    const list = await Pickup.find({ userId: req.user._id }).sort({createdAt:-1});
    res.json(list);
  } catch(e){ res.status(500).json({ error: 'Server error' }); }
});

// update status (admin)
router.patch('/:id/status', auth, async (req,res)=>{
  try {
    if (!req.user || req.user.role === 'user') return res.status(403).json({ error: 'Forbidden' });
    const p = await Pickup.findById(req.params.id);
    if (!p) return res.status(404).json({ error: 'Not found' });
    p.status = req.body.status || p.status;
    await p.save();
    res.json(p);
  } catch(e){ res.status(500).json({ error: 'Server error' }); }
});

module.exports = router;
