const mongoose = require('mongoose');

const invitationSchema = new mongoose.Schema({
  inviteCode: { type: String, required: true, unique: true },
  admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  inviteeEmail: { type: String, required: true },
  inviteeName: { type: String },
  relationship: { type: String, enum: ['spouse', 'child'], required: true },
  status: { type: String, enum: ['sent', 'accepted', 'expired'], default: 'sent' },
  acceptedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  expiresAt: { type: Date, default: () => new Date(+new Date() + 30*24*60*60*1000) }, // 30 days
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Invitation', invitationSchema);
