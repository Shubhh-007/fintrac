const Expense = require('../models/Expense');
const User = require('../models/User');
const AppError = require('../utils/AppError');

// Helper to check if a user has permission to manage an expense
const checkExpensePermission = async (expense, user) => {
  if (user.role === 'admin') {
    if (expense.user.toString() === user.id) return true;
    if (expense.familyId && expense.familyId.toString() === user.id) return true;
    
    // Fallback/Lookup owner's family
    const expenseOwner = await User.findById(expense.user);
    if (expenseOwner && expenseOwner.familyId && expenseOwner.familyId.toString() === user.id) {
      return true;
    }
    return false;
  }
  return expense.user.toString() === user.id;
};

const getAllExpenses = async (user) => {
  if (user.role === 'admin') {
    // Find all family members first
    const familyMembers = await User.find({
      $or: [
        { _id: user.id },
        { familyId: user.id }
      ]
    }).select('_id');
    const memberIds = familyMembers.map(m => m._id);

    return await Expense.find({
      $or: [
        { familyId: user.id },
        { user: { $in: memberIds } }
      ]
    }).populate('user', 'name email role').sort({ date: -1 });
  }
  return await Expense.find({ user: user.id }).sort({ date: -1 });
};

const createExpense = async (expenseData, userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }
  const familyId = user.role === 'admin' ? user._id : user.familyId;
  const expense = await Expense.create({
    ...expenseData,
    user: userId,
    familyId: familyId
  });
  return expense;
};

const updateExpense = async (expenseId, expenseData, user) => {
  const expense = await Expense.findById(expenseId);
  if (!expense) {
    throw new AppError('Expense not found', 404);
  }

  // Check permission
  const hasPermission = await checkExpensePermission(expense, user);
  if (!hasPermission) {
    throw new AppError('Not authorized to update this expense', 403);
  }

  // Update fields
  const updatedExpense = await Expense.findByIdAndUpdate(
    expenseId,
    { $set: expenseData },
    { new: true, runValidators: true }
  );

  return updatedExpense;
};

const deleteExpense = async (expenseId, user) => {
  const expense = await Expense.findById(expenseId);
  if (!expense) {
    throw new AppError('Expense not found', 404);
  }

  // Check permission
  const hasPermission = await checkExpensePermission(expense, user);
  if (!hasPermission) {
    throw new AppError('Not authorized to delete this expense', 403);
  }

  await expense.deleteOne();
  return { message: 'Expense removed' };
};

module.exports = {
  getAllExpenses,
  createExpense,
  updateExpense,
  deleteExpense
};

