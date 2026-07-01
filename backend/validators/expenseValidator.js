const { body, param, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const AppError = require('../utils/AppError');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMsgs = errors.array().map(err => err.msg).join('. ');
    return next(new AppError(errorMsgs, 400));
  }
  next();
};

const expenseCreateValidator = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .escape(),
  body('amount')
    .isNumeric().withMessage('Amount must be a number')
    .custom(value => value > 0).withMessage('Amount must be greater than 0'),
  body('category')
    .trim()
    .notEmpty().withMessage('Category is required')
    .escape(),
  body('date')
    .optional()
    .isISO8601().withMessage('Date must be a valid ISO date'),
  body('description')
    .optional()
    .trim()
    .escape(),
  body('type')
    .optional()
    .isIn(['expense', 'income']).withMessage('Type must be either expense or income'),
  validate
];

const expenseUpdateValidator = [
  param('id')
    .custom(value => mongoose.Types.ObjectId.isValid(value)).withMessage('Invalid expense ID format'),
  body('title')
    .optional()
    .trim()
    .notEmpty().withMessage('Title cannot be empty')
    .escape(),
  body('amount')
    .optional()
    .isNumeric().withMessage('Amount must be a number')
    .custom(value => value > 0).withMessage('Amount must be greater than 0'),
  body('category')
    .optional()
    .trim()
    .notEmpty().withMessage('Category cannot be empty')
    .escape(),
  body('date')
    .optional()
    .isISO8601().withMessage('Date must be a valid ISO date'),
  body('description')
    .optional()
    .trim()
    .escape(),
  body('type')
    .optional()
    .isIn(['expense', 'income']).withMessage('Type must be either expense or income'),
  validate
];

const idParamValidator = [
  param('id')
    .custom(value => mongoose.Types.ObjectId.isValid(value)).withMessage('Invalid ID format'),
  validate
];

module.exports = { expenseCreateValidator, expenseUpdateValidator, idParamValidator };
