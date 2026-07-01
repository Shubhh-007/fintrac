const express = require('express');
const router = express.Router();
const { getExpenses, addExpense, updateExpense, deleteExpense } = require('../controllers/expenseController');
const { verifyToken } = require('../middleware/authMiddleware');
const { expenseCreateValidator, expenseUpdateValidator, idParamValidator } = require('../validators/expenseValidator');

router.use(verifyToken); // All routes protected by default

router.route('/')
  .get(getExpenses)
  .post(expenseCreateValidator, addExpense);

router.route('/:id')
  .put(expenseUpdateValidator, updateExpense)
  .delete(idParamValidator, deleteExpense);

module.exports = router;
