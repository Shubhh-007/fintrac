const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: { 
    type: String, 
    enum: ['GROUP_JOIN', 'GROUP_REMOVE', 'GROUP_UPDATE', 'PROFILE_UPDATE', 'SECURITY_ALERT', 'INVITATION', 'SYSTEM'], 
    required: true 
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  relatedEntityId: { type: mongoose.Schema.Types.ObjectId }
}, { 
  timestamps: true 
});

module.exports = mongoose.model('Notification', notificationSchema);
