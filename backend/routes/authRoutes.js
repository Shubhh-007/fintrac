const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  logoutUser,
  getProfile,
  verifyOtp,
  resendOtp,
  forgotPassword,
  resetPassword
} = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');
const {
  registerValidator,
  loginValidator,
  verifyOtpValidator,
  resendOtpValidator,
  forgotPasswordValidator,
  resetPasswordValidator
} = require('../validators/authValidator');

router.post('/register', registerValidator, registerUser);
router.post('/login', loginValidator, loginUser);
router.post('/logout', logoutUser);
router.get('/me', verifyToken, getProfile);

// OTP Verification routes
router.post('/verify-otp', verifyOtpValidator, verifyOtp);
router.post('/resend-otp', resendOtpValidator, resendOtp);

// Forgot & Reset Password routes
router.post('/forgot-password', forgotPasswordValidator, forgotPassword);
router.post('/reset-password', resetPasswordValidator, resetPassword);

module.exports = router;
