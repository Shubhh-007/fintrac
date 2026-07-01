const User = require('../models/User');
const Expense = require('../models/Expense');
const Invitation = require('../models/Invitation');
const crypto = require('crypto');
const AppError = require('../utils/AppError');

const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

const getUserStats = async (req, res, next) => {
  try {
    // Total users count
    const totalUsers = await User.countDocuments();

    // Aggregation for expenses per user
    const expenseStats = await Expense.aggregate([
      {
        $group: {
          _id: '$user',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Populate user names for the stats
    const statsWithUserInfo = await Promise.all(
      expenseStats.map(async (stat) => {
        const user = await User.findById(stat._id).select('name email role');
        return {
          user,
          totalAmount: stat.totalAmount,
          count: stat.count
        };
      })
    );

    // Calculate total family expenses
    const totalFamilyExpenses = expenseStats.reduce((sum, item) => sum + item.totalAmount, 0);

    res.status(200).json({
      totalUsers,
      totalFamilyExpenses,
      userBreakdown: statsWithUserInfo
    });
  } catch (error) {
    next(error);
  }
};

// Get all family members (for admin)
const getFamilyMembers = async (req, res, next) => {
  try {
    // Get all users that belong to this admin or are this admin
    const members = await User.find({
      $or: [
        { _id: req.user._id }, // The admin themselves
        { familyId: req.user._id } // Users invited by this admin
      ]
    }).select('-password').sort({ familyJoinDate: -1 });

    // Get expense stats for each member
    const membersWithStats = await Promise.all(
      members.map(async (member) => {
        const expenseData = await Expense.aggregate([
          { $match: { user: member._id } },
          {
            $group: {
              _id: null,
              totalExpenses: { $sum: { $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0] } },
              totalIncome: { $sum: { $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0] } },
              count: { $sum: 1 }
            }
          }
        ]);

        return {
          ...member.toObject(),
          expenseStats: expenseData[0] || { totalExpenses: 0, totalIncome: 0, count: 0 }
        };
      })
    );

    res.status(200).json(membersWithStats);
  } catch (error) {
    next(error);
  }
};

// Get member expenses (for admin viewing a specific member)
const getMemberExpenses = async (req, res, next) => {
  try {
    const { memberId } = req.params;

    // Verify the member belongs to this admin
    const member = await User.findById(memberId);
    if (!member || (member._id.toString() !== req.user._id.toString() && (!member.familyId || member.familyId.toString() !== req.user._id.toString()))) {
      return next(new AppError('Unauthorized access to member expenses', 403));
    }

    const expenses = await Expense.find({ user: memberId })
      .populate('user', 'name email')
      .sort({ date: -1 });

    const stats = await Expense.aggregate([
      { $match: { user: member._id } },
      {
        $group: {
          _id: null,
          totalExpenses: { $sum: { $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0] } },
          totalIncome: { $sum: { $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0] } },
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      member: member.toObject(),
      expenses,
      stats: stats[0] || { totalExpenses: 0, totalIncome: 0, count: 0 }
    });
  } catch (error) {
    next(error);
  }
};

// Send family invitation
const sendInvitation = async (req, res, next) => {
  try {
    const { inviteeEmail, inviteeName, relationship } = req.body;

    if (!inviteeEmail || !relationship) {
      return next(new AppError('Email and relationship are required', 400));
    }

    // Check if user already in family
    const existingMember = await User.findOne({
      email: inviteeEmail,
      $or: [{ _id: req.user._id }, { familyId: req.user._id }]
    });

    if (existingMember) {
      return next(new AppError('User is already part of your family', 400));
    }

    const inviteCode = `FAM-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

    const invitation = await Invitation.create({
      inviteCode,
      admin: req.user._id,
      inviteeEmail,
      inviteeName,
      relationship
    });

    res.status(201).json({
      success: true,
      message: 'Invitation sent successfully',
      invitation: {
        inviteCode: invitation.inviteCode,
        status: invitation.status,
        expiresAt: invitation.expiresAt
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get pending invitations (for admin)
const getPendingInvitations = async (req, res, next) => {
  try {
    const invitations = await Invitation.find({
      admin: req.user._id,
      status: { $in: ['sent', 'accepted'] }
    }).sort({ createdAt: -1 });

    res.status(200).json(invitations);
  } catch (error) {
    next(error);
  }
};

// Get invitation details by code (for signup page)
const getInvitationDetails = async (req, res, next) => {
  try {
    const { code } = req.params;

    const invitation = await Invitation.findOne({ inviteCode: code, status: 'sent' })
      .populate('admin', 'name email');

    if (!invitation || new Date() > invitation.expiresAt) {
      return next(new AppError('Invalid or expired invite code', 400));
    }

    res.status(200).json({
      inviteCode: invitation.inviteCode,
      adminName: invitation.admin.name,
      relationship: invitation.relationship,
      inviteeName: invitation.inviteeName,
      inviteeEmail: invitation.inviteeEmail
    });
  } catch (error) {
    next(error);
  }
};

// Get invitation sent to current logged-in user's email (for user dashboard)
const getMyInvitation = async (req, res, next) => {
  try {
    const invitation = await Invitation.findOne({
      inviteeEmail: req.user.email,
      status: 'sent'
    }).populate('admin', 'name email');

    if (!invitation) {
      return res.status(200).json(null);
    }

    res.status(200).json({
      inviteCode: invitation.inviteCode,
      adminName: invitation.admin.name,
      relationship: invitation.relationship,
      expiresAt: invitation.expiresAt
    });
  } catch (error) {
    next(error);
  }
};

// Accept a family invitation (logged-in user accepts their invite)
const acceptInvitation = async (req, res, next) => {
  try {
    const { inviteCode } = req.body;

    const invitation = await Invitation.findOne({
      inviteCode,
      inviteeEmail: req.user.email,
      status: 'sent'
    }).populate('admin', 'name email');

    if (!invitation) {
      return next(new AppError('Invalid or already used invite code', 400));
    }

    if (new Date() > invitation.expiresAt) {
      return next(new AppError('This invitation has expired', 400));
    }

    // Link the user to the admin's family
    await User.findByIdAndUpdate(req.user._id, {
      familyId: invitation.admin._id,
      invitedBy: invitation.admin._id,
      relationship: invitation.relationship,
      status: 'active',
      familyJoinDate: new Date()
    });

    // Mark invitation as accepted
    invitation.status = 'accepted';
    invitation.acceptedBy = req.user._id;
    await invitation.save();

    res.status(200).json({
      success: true,
      message: `You have joined ${invitation.admin.name}'s family as ${invitation.relationship}!`
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers,
  getUserStats,
  getFamilyMembers,
  getMemberExpenses,
  sendInvitation,
  getPendingInvitations,
  getInvitationDetails,
  getMyInvitation,
  acceptInvitation
};
