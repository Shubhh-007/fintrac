const { body, validationResult } = require('express-validator');
const AppError = require('../utils/AppError');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMsgs = errors.array().map(err => err.msg).join('. ');
    return next(new AppError(errorMsgs, 400));
  }
  next();
};

const registerValidator = [
  body('email')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
    .trim(),
  body('name')
    .optional()
    .trim()
    .notEmpty().withMessage('Name cannot be empty')
    .escape(),
  body('firstName')
    .optional()
    .trim()
    .notEmpty().withMessage('First name cannot be empty')
    .escape(),
  body('lastName')
    .optional()
    .trim()
    .escape(),
  body('role')
    .optional()
    .isIn(['user', 'admin']).withMessage('Role must be either user or admin'),
  (req, res, next) => {
    // If name is not explicitly passed but firstName/lastName are, combine them
    if (!req.body.name && (req.body.firstName || req.body.lastName)) {
      req.body.name = `${req.body.firstName || ''} ${req.body.lastName || ''}`.trim();
    }
    // Name is required at the end
    if (!req.body.name) {
      return next(new AppError('Name is required', 400));
    }
    next();
  },
  validate
];

const loginValidator = [
  body('email')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
    .trim(),
  validate
];

const verifyOtpValidator = [
  body('email')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('otp')
    .isLength({ min: 6, max: 6 }).withMessage('OTP must be exactly 6 digits')
    .isNumeric().withMessage('OTP must contain only numbers')
    .trim(),
  validate
];

const resendOtpValidator = [
  body('email')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),
  validate
];

const forgotPasswordValidator = [
  body('email')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),
  validate
];

const resetPasswordValidator = [
  body('email')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('otp')
    .isLength({ min: 6, max: 6 }).withMessage('OTP must be exactly 6 digits')
    .isNumeric().withMessage('OTP must contain only numbers')
    .trim(),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
    .trim(),
  validate
];

module.exports = {
  registerValidator,
  loginValidator,
  verifyOtpValidator,
  resendOtpValidator,
  forgotPasswordValidator,
  resetPasswordValidator
};
