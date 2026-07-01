const Expense = require('../models/Expense');
const AppError = require('../utils/AppError');

const getAllExpenses = async (user) => {
  if (user.role === 'admin') {
    return await Expense.find({}).populate('user', 'name email role').sort({ date: -1 });
  }
  return await Expense.find({ user: user.id }).sort({ date: -1 });
};

const createExpense = async (expenseData, userId) => {
  const expense = await Expense.create({
    ...expenseData,
    user: userId
  });
  return expense;
};

const updateExpense = async (expenseId, expenseData, user) => {
  const expense = await Expense.findById(expenseId);
  if (!expense) {
    throw new AppError('Expense not found', 404);
  }

  // Check permission
  if (user.role !== 'admin' && expense.user.toString() !== user.id) {
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
  if (user.role !== 'admin' && expense.user.toString() !== user.id) {
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
