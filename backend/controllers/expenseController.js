const expenseService = require('../services/expenseService');

const getExpenses = async (req, res, next) => {
  try {
    const expenses = await expenseService.getAllExpenses(req.user);
    res.status(200).json(expenses);
  } catch (error) {
    next(error);
  }
};

const addExpense = async (req, res, next) => {
  try {
    const expense = await expenseService.createExpense(req.body, req.user.id);
    res.status(201).json(expense);
  } catch (error) {
    next(error);
  }
};

const updateExpense = async (req, res, next) => {
  try {
    const expense = await expenseService.updateExpense(req.params.id, req.body, req.user);
    res.status(200).json(expense);
  } catch (error) {
    next(error);
  }
};

const deleteExpense = async (req, res, next) => {
  try {
    const result = await expenseService.deleteExpense(req.params.id, req.user);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getExpenses,
  addExpense,
  updateExpense,
  deleteExpense
};
