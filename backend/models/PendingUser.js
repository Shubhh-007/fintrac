const mongoose = require('mongoose');

const pendingUserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  familyId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  relationship: { type: String, enum: ['admin', 'spouse', 'child'], default: 'admin' },
  status: { type: String, enum: ['active', 'pending'], default: 'active' },
  familyJoinDate: { type: Date },
  invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  inviteCode: { type: String },
  
  otpHash: { type: String, required: true },
  otpExpiry: { type: Date, required: true },
  otpAttempts: { type: Number, default: 0 },
  otpSentAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

// TTL index to automatically delete pending registration after 5 minutes (300 seconds)
pendingUserSchema.index({ createdAt: 1 }, { expireAfterSeconds: 300 });

module.exports = mongoose.model('PendingUser', pendingUserSchema);
