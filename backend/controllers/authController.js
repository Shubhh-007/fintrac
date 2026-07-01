const User = require('../models/User');
const Invitation = require('../models/Invitation');
const AppError = require('../utils/AppError');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

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

    // Handle admin registration
    if (role === 'admin') {
      if (!adminSecret || adminSecret !== process.env.ADMIN_SECRET) {
        return res.status(401).json({
          success: false,
          message: "Invalid Admin Secret"
        });
      }
      
      const user = await User.create({ 
        name, 
        email, 
        password, 
        role: 'admin',
        relationship: 'admin',
        status: 'active',
        familyJoinDate: new Date()
      });
      
      const token = jwt.sign(
        { id: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );
      
      return res.status(201).json({
        token,
        user: {
          _id: user._id,
          name: user.name,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role
        }
      });
    }

    // Handle user registration with invite code
    if (role === 'user' && inviteCode) {
      const invitation = await Invitation.findOne({ inviteCode, status: 'sent' });
      
      if (!invitation) {
        return next(new AppError('Invalid or expired invite code', 400));
      }
      
      if (new Date() > invitation.expiresAt) {
        return next(new AppError('Invite code has expired', 400));
      }
      
      const user = await User.create({
        name: name || invitation.inviteeName,
        email,
        password,
        role: 'user',
        familyId: invitation.admin,
        invitedBy: invitation.admin,
        relationship: invitation.relationship,
        status: 'active',
        familyJoinDate: new Date()
      });
      
      // Mark invitation as accepted
      invitation.status = 'accepted';
      invitation.acceptedBy = user._id;
      await invitation.save();
      
      const token = jwt.sign(
        { id: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );
      
      return res.status(201).json({
        token,
        user: {
          _id: user._id,
          name: user.name,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          familyId: user.familyId,
          relationship: user.relationship
        }
      });
    }

    // Regular user registration without invite
    const user = await User.create({ 
      name, 
      email, 
      password, 
      role: 'user',
      status: 'active'
    });
    
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
        role: user.role
      }
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

module.exports = { registerUser, loginUser, logoutUser, getProfile, generateInviteCode };
