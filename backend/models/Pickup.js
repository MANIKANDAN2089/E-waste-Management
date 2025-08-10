const mongoose = require('mongoose');

const pickupSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: String,
  phone: String,
  email: String,
  address: String,
  preferredDate: Date,
  items: String,
  status: { type: String, enum: ['pending','accepted','completed','cancelled'], default: 'pending' }
}, { timestamps: true });

module.exports = mongoose.model('Pickup', pickupSchema);
