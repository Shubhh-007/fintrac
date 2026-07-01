const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  
  // Family relationships
  familyId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Points to admin/parent
  relationship: { type: String, enum: ['admin', 'spouse', 'child'], default: 'admin' }, // Role in family
  status: { type: String, enum: ['active', 'pending'], default: 'active' }, // Pending = invitation sent
  familyJoinDate: { type: Date },
  invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Admin who invited this user
  inviteCode: { type: String, unique: true, sparse: true } // Invitation code
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

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
