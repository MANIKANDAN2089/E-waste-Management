const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token' });
  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'verysecretkey');
    req.user = await User.findById(payload.id).select('-passwordHash');
    next();
  } catch (e) {
    res.status(401).json({ error: 'Invalid token' });
  }
};
