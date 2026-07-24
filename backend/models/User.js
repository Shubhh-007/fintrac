const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  
  // Verification status
  isVerified: { type: Boolean, default: false },
  otpHash: { type: String },
  otpExpiry: { type: Date },
  otpAttempts: { type: Number, default: 0 },
  otpSentAt: { type: Date },
  
  // Family relationships
  familyId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Legacy backward compatibility
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' }, // New standard
  relationship: { type: String, enum: ['admin', 'spouse', 'child'], default: 'admin' }, // Role in family
  status: { type: String, enum: ['active', 'pending'], default: 'active' }, // Pending = invitation sent
  familyJoinDate: { type: Date },
  invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Admin who invited this user
  inviteCode: { type: String, unique: true, sparse: true }, // Invitation code
  
  // Additional Profile Data
  phone: { type: String },
  gender: { type: String, enum: ['Male', 'Female', 'Other', 'Prefer not to say'] },
  
  // Preferences
  preferences: {
    theme: { type: String, enum: ['light', 'dark'], default: 'light' },
    currency: { type: String, default: 'INR' },
    language: { type: String, default: 'en' },
    emailNotifications: { type: Boolean, default: true },
    inAppNotifications: { type: Boolean, default: true }
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtuals for backward compatibility with frontend
userSchema.virtual('firstName').get(function() {
  return this.name ? this.name.split(' ')[0] : '';
});

userSchema.virtual('lastName').get(function() {
  if (!this.name) return '';
  const parts = this.name.split(' ');
  return parts.slice(1).join(' ') || '';
});

userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  // If already a bcrypt hash, do not hash it again
  if (this.password && /^\$2[aby]\$[0-9]{2}\$[./A-Za-z0-9]{53}$/.test(this.password)) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
