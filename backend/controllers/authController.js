const User = require('../models/User');
const PendingUser = require('../models/PendingUser');
const Invitation = require('../models/Invitation');
const AppError = require('../utils/AppError');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const sendEmail = require('../utils/sendEmail');

const generateInviteCode = () => {
  return `FAM-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
};

const registerUser = async (req, res, next) => {
  const { name, email, password, role, adminSecret, inviteCode } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return next(new AppError('Email already exists', 400));
    }

    // If registering with invite code, validate it BEFORE sending OTP
    let invitation = null;
    if (role === 'user' && inviteCode) {
      invitation = await Invitation.findOne({ inviteCode, status: 'sent' });
      if (!invitation) {
        return next(new AppError('Invalid or expired invite code', 400));
      }
      if (new Date() > invitation.expiresAt) {
        return next(new AppError('Invite code has expired', 400));
      }
    }

    // Rate limit check for requesting OTP
    const existingPending = await PendingUser.findOne({ email });
    if (existingPending && existingPending.otpSentAt && (Date.now() - existingPending.otpSentAt < 60000)) {
      return next(new AppError('Please wait 60 seconds before requesting a new OTP', 429));
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Hash Password and OTP
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const hashedOtp = await bcrypt.hash(otp, salt);

    // Save or update pending user details
    await PendingUser.findOneAndUpdate(
      { email },
      {
        name,
        email,
        password: hashedPassword,
        role: role || 'user',
        familyId: role === 'user' && invitation ? invitation.admin : undefined,
        relationship: role === 'user' && invitation ? invitation.relationship : (role === 'admin' ? 'admin' : undefined),
        invitedBy: role === 'user' && invitation ? invitation.admin : undefined,
        inviteCode: role === 'user' && inviteCode ? inviteCode : undefined,
        otpHash: hashedOtp,
        otpExpiry,
        otpAttempts: 0,
        otpSentAt: new Date(),
        createdAt: new Date()
      },
      { upsert: true, new: true }
    );

    // Send email with Nodemailer
    try {
      await sendEmail({
        to: email,
        subject: 'Fintrac - Verify your email address',
        name,
        otp,
        title: 'Email Verification OTP',
        message: 'Thank you for registering with Fintrac. To complete your signup and verify your account, please enter the following 6-digit Verification Code:'
      });
    } catch (mailError) {
      console.error('Mail send error:', mailError);
      // Clean up the pending user so registration can be retried immediately
      await PendingUser.deleteOne({ email });
      return next(new AppError('Failed to send OTP email. Please verify your email address is correct and try again.', 500));
    }

    res.status(200).json({
      success: true,
      message: 'OTP sent to email. Please verify your email to complete registration.',
      email
    });
  } catch (error) {
    next(error);
  }
};

const verifyOtp = async (req, res, next) => {
  const { email, otp } = req.body;
  try {
    const pendingUser = await PendingUser.findOne({ email });
    if (!pendingUser) {
      return next(new AppError('OTP expired or registration session not found. Please register again.', 400));
    }

    // Check expiry
    if (new Date() > pendingUser.otpExpiry) {
      await PendingUser.deleteOne({ email });
      return next(new AppError('OTP has expired. Please register again.', 400));
    }

    // Check attempts limit
    if (pendingUser.otpAttempts >= 5) {
      await PendingUser.deleteOne({ email });
      return next(new AppError('Too many failed attempts. Please register again.', 400));
    }

    // Verify OTP
    const isMatch = await bcrypt.compare(otp, pendingUser.otpHash);
    if (!isMatch) {
      pendingUser.otpAttempts += 1;
      await pendingUser.save();
      
      const attemptsLeft = 5 - pendingUser.otpAttempts;
      if (attemptsLeft <= 0) {
        await PendingUser.deleteOne({ email });
        return next(new AppError('Too many incorrect attempts. Registration session cleared.', 400));
      }
      return next(new AppError(`Invalid OTP. ${attemptsLeft} attempts remaining.`, 400));
    }

    // OTP is valid! Create the real User
    const userPayload = {
      name: pendingUser.name,
      email: pendingUser.email,
      password: pendingUser.password, // Pre-hashed password
      role: pendingUser.role,
      isVerified: true,
      status: 'active'
    };

    if (pendingUser.role === 'admin') {
      userPayload.relationship = 'admin';
      userPayload.familyJoinDate = new Date();
    } else if (pendingUser.role === 'user' && pendingUser.inviteCode) {
      const invitation = await Invitation.findOne({ inviteCode: pendingUser.inviteCode, status: 'sent' });
      if (invitation) {
        userPayload.familyId = invitation.admin;
        userPayload.invitedBy = invitation.admin;
        userPayload.relationship = invitation.relationship;
        userPayload.familyJoinDate = new Date();
      }
    }

    const user = await User.create(userPayload);

    // If user registered with invitation, accept it
    if (pendingUser.role === 'user' && pendingUser.inviteCode) {
      const invitation = await Invitation.findOne({ inviteCode: pendingUser.inviteCode, status: 'sent' });
      if (invitation) {
        invitation.status = 'accepted';
        invitation.acceptedBy = user._id;
        await invitation.save();
      }
    }

    // Delete pending record
    await PendingUser.deleteOne({ email });

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        familyId: user.familyId,
        relationship: user.relationship,
        status: user.status
      }
    });
  } catch (error) {
    next(error);
  }
};

const resendOtp = async (req, res, next) => {
  const { email } = req.body;
  try {
    const pendingUser = await PendingUser.findOne({ email });
    if (!pendingUser) {
      return next(new AppError('Registration session not found. Please sign up again.', 400));
    }

    // Rate limit: 60 seconds resend cooldown
    if (pendingUser.otpSentAt && (Date.now() - pendingUser.otpSentAt < 60000)) {
      return next(new AppError('Please wait 60 seconds before requesting a new OTP', 429));
    }

    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    const salt = await bcrypt.genSalt(10);
    const hashedOtp = await bcrypt.hash(otp, salt);

    pendingUser.otpHash = hashedOtp;
    pendingUser.otpExpiry = otpExpiry;
    pendingUser.otpAttempts = 0;
    pendingUser.otpSentAt = new Date();
    pendingUser.createdAt = new Date();
    await pendingUser.save();

    // Send email
    try {
      await sendEmail({
        to: email,
        subject: 'Fintrac - Verify your email address',
        name: pendingUser.name,
        otp,
        title: 'New Verification OTP',
        message: 'You requested a new Verification Code for your Fintrac account. Please enter the following 6-digit OTP:'
      });
    } catch (mailError) {
      console.error('Mail send error:', mailError);
      return next(new AppError('Failed to send OTP email. Please try again.', 500));
    }

    res.status(200).json({
      success: true,
      message: 'A new OTP has been sent to your email.'
    });
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return next(new AppError('No account found with this email address.', 404));
    }

    // Rate limit: 60 seconds resend cooldown
    if (user.otpSentAt && (Date.now() - user.otpSentAt < 60000)) {
      return next(new AppError('Please wait 60 seconds before requesting a new OTP', 429));
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    const salt = await bcrypt.genSalt(10);
    const hashedOtp = await bcrypt.hash(otp, salt);

    user.otpHash = hashedOtp;
    user.otpExpiry = otpExpiry;
    user.otpAttempts = 0;
    user.otpSentAt = new Date();
    await user.save();

    // Send email
    try {
      await sendEmail({
        to: email,
        subject: 'Fintrac - Reset your password',
        name: user.name,
        otp,
        title: 'Password Reset OTP',
        message: 'We received a request to reset your Fintrac password. Enter the 6-digit OTP code below to reset your password:'
      });
    } catch (mailError) {
      console.error('Mail send error:', mailError);
      user.otpHash = undefined;
      user.otpExpiry = undefined;
      user.otpSentAt = undefined;
      await user.save();
      return next(new AppError('Failed to send password reset email. Please try again.', 500));
    }

    res.status(200).json({
      success: true,
      message: 'Password reset OTP sent to your email.'
    });
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  const { email, otp, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return next(new AppError('No account found with this email address.', 404));
    }

    if (!user.otpHash || !user.otpExpiry) {
      return next(new AppError('Password reset request expired or not initiated. Please request a new OTP.', 400));
    }

    // Check expiry
    if (new Date() > user.otpExpiry) {
      user.otpHash = undefined;
      user.otpExpiry = undefined;
      user.otpAttempts = 0;
      user.otpSentAt = undefined;
      await user.save();
      return next(new AppError('OTP has expired. Please request a new OTP.', 400));
    }

    // Check attempts limit
    if (user.otpAttempts >= 5) {
      user.otpHash = undefined;
      user.otpExpiry = undefined;
      user.otpAttempts = 0;
      user.otpSentAt = undefined;
      await user.save();
      return next(new AppError('Too many failed attempts. Please request a new OTP.', 400));
    }

    // Verify OTP
    const isMatch = await bcrypt.compare(otp, user.otpHash);
    if (!isMatch) {
      user.otpAttempts += 1;
      await user.save();

      const attemptsLeft = 5 - user.otpAttempts;
      if (attemptsLeft <= 0) {
        user.otpHash = undefined;
        user.otpExpiry = undefined;
        user.otpAttempts = 0;
        user.otpSentAt = undefined;
        await user.save();
        return next(new AppError('Too many incorrect attempts. Reset session cleared.', 400));
      }
      return next(new AppError(`Invalid OTP. ${attemptsLeft} attempts remaining.`, 400));
    }

    // OTP is valid! Reset password
    user.password = password; // pre-save hook will hash this
    user.otpHash = undefined;
    user.otpExpiry = undefined;
    user.otpAttempts = 0;
    user.otpSentAt = undefined;
    
    if (!user.isVerified) {
      user.isVerified = true;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password has been reset successfully. You can now log in.'
    });
  } catch (error) {
    next(error);
  }
};

const loginUser = async (req, res, next) => {
  const { email, password, role } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return next(new AppError('Invalid credentials', 401));
    }

    if (!user.isVerified) {
      return next(new AppError('Please verify your email before logging in.', 400));
    }

    if (role === 'admin' && user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Role mismatch' });
    }

    if (role && user.role !== role) {
      return res.status(401).json({ success: false, message: 'Role mismatch' });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        familyId: user.familyId,
        relationship: user.relationship,
        status: user.status
      }
    });
  } catch (error) {
    next(error);
  }
};

const logoutUser = (req, res) => {
  res.status(200).json({ message: 'Logged out successfully' });
};

const getProfile = async (req, res, next) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getProfile,
  generateInviteCode,
  verifyOtp,
  resendOtp,
  forgotPassword,
  resetPassword
};
