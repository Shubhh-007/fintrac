const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  amount: { type: Number, required: true, min: [0.01, 'Amount must be greater than 0'] },
  category: { type: String, required: true },
  date: { type: Date, default: Date.now },
  description: { type: String },
  type: { type: String, enum: ['income', 'expense'], default: 'expense' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  familyId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // Admin/parent of the family
}, { timestamps: true });

// Index for query optimization
expenseSchema.index({ user: 1, date: -1 });
expenseSchema.index({ familyId: 1, date: -1 });

module.exports = mongoose.model('Expense', expenseSchema);
