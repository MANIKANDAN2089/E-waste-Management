const express = require('express');
const router = express.Router();
const Consult = require('../models/Consult');
const auth = require('../middleware/auth');

// create consult (auth optional)
router.post('/', auth, async (req,res)=>{
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
  } catch(e){ console.error(e); res.status(500).json({ error: 'Server error' }); }
});

// list consults (admin/expert)
router.get('/', auth, async (req,res)=>{
  try {
    if (!req.user || req.user.role === 'user') return res.status(403).json({ error: 'Forbidden' });
    const list = await Consult.find().populate('userId','name email').sort({createdAt:-1});
    res.json(list);
  } catch(e){ res.status(500).json({ error: 'Server error' }); }
});

// user consults
router.get('/me', auth, async (req,res)=>{
  try {
    const list = await Consult.find({ userId: req.user._id }).sort({createdAt:-1});
    res.json(list);
  } catch(e){ res.status(500).json({ error: 'Server error' }); }
});

// update consult status / assign expert (admin/expert)
router.patch('/:id', auth, async (req,res)=>{
  try {
    if (!req.user || req.user.role === 'user') return res.status(403).json({ error: 'Forbidden' });
    const c = await Consult.findById(req.params.id);
    if (!c) return res.status(404).json({ error: 'Not found' });
    if (req.body.status) c.status = req.body.status;
    if (req.body.assignedExpert) c.assignedExpert = req.body.assignedExpert;
    if (req.body.notes) c.notes = req.body.notes;
    await c.save();
    res.json(c);
  } catch(e){ res.status(500).json({ error: 'Server error' }); }
});

module.exports = router;
