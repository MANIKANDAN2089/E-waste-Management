const mongoose = require('mongoose');

const consultSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: String,
  phone: String,
  email: String,
  category: String,
  description: String,
  preferredDate: Date,
  mode: { type: String, enum: ['call','video','in-person'], default: 'call' },
  status: { type: String, enum: ['pending','scheduled','completed','cancelled'], default: 'pending' },
  assignedExpert: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  notes: String
}, { timestamps: true });

module.exports = mongoose.model('Consult', consultSchema);
