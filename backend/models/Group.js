const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true }, // One admin can only have one group currently
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  status: { type: String, enum: ['active', 'disabled'], default: 'active' },
  inviteCode: { type: String, sparse: true } // Can hold a reusable invite code for the group
}, { 
  timestamps: true 
});

module.exports = mongoose.model('Group', groupSchema);
