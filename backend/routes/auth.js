const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// register
router.post('/register', async (req,res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'Missing fields' });
    
    // Only allow admin registration with special code
    if (role === 'admin' && req.body.adminCode !== process.env.ADMIN_CODE) {
      return res.status(403).json({ error: 'Invalid admin registration code' });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Email already registered' });
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const user = new User({ 
      name, 
      email, 
      passwordHash,
      role: role === 'admin' ? 'admin' : 'user' 
    });
    await user.save();
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'verysecretkey', { expiresIn: '1d' });
    res.json({ 
      token, 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role 
      } 
    });
  } catch (err) {
    console.error(err); res.status(500).json({ error: 'Server error' });
  }
});

// login
router.post('/login', async (req,res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(400).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'verysecretkey', { expiresIn: '1d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error(err); res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
