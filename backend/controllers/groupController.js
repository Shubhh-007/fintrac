const Group = require('../models/Group');
const User = require('../models/User');
const Notification = require('../models/Notification');
const AppError = require('../utils/AppError');

// Create a group (typically called once by an admin if they don't have one)
exports.createGroup = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    
    // Only admin can create groups
    if (req.user.role !== 'admin') {
      return next(new AppError('Only admins can create groups', 403));
    }

    // Check if admin already has a group
    let group = await Group.findOne({ admin: req.user._id });
    if (group) {
      return next(new AppError('You already manage a group', 400));
    }

    group = await Group.create({
      name,
      description,
      admin: req.user._id,
      members: []
    });

    // Update admin's groupId
    await User.findByIdAndUpdate(req.user._id, { groupId: group._id });

    res.status(201).json({
      success: true,
      group
    });
  } catch (error) {
    next(error);
  }
};

// Get details of the group the user belongs to or manages
exports.getMyGroup = async (req, res, next) => {
  try {
    let group;
    if (req.user.role === 'admin') {
      group = await Group.findOne({ admin: req.user._id })
        .populate('admin', 'name email phone')
        .populate('members', 'name email status role familyJoinDate relationship');
    } else {
      // Find the group the user is a part of
      group = await Group.findOne({ members: req.user._id })
        .populate('admin', 'name email phone')
        .populate('members', 'name email status role familyJoinDate relationship');
    }

    // It's possible an admin hasn't set up a group name yet, or a user hasn't joined one
    if (!group) {
      return res.status(200).json(null);
    }

    res.status(200).json(group);
  } catch (error) {
    next(error);
  }
};

// Update group details
exports.updateGroup = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    const group = await Group.findOneAndUpdate(
      { admin: req.user._id },
      { name, description },
      { new: true, runValidators: true }
    );

    if (!group) {
      return next(new AppError('Group not found', 404));
    }

    // Notify members (Optional: might be spammy, but demonstrates real-time capability)
    const members = await User.find({ groupId: group._id, _id: { $ne: req.user._id } });
    const notifications = members.map(m => ({
      recipient: m._id,
      sender: req.user._id,
      type: 'GROUP_UPDATE',
      title: 'Group Details Updated',
      message: `The details for ${group.name} have been updated by the admin.`,
      relatedEntityId: group._id
    }));
    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    res.status(200).json({
      success: true,
      group
    });
  } catch (error) {
    next(error);
  }
};

// Remove a member from the group
exports.removeMember = async (req, res, next) => {
  try {
    const { memberId } = req.params;

    const group = await Group.findOne({ admin: req.user._id });
    if (!group) {
      return next(new AppError('Group not found', 404));
    }

    const member = await User.findById(memberId);
    if (!member || member.groupId?.toString() !== group._id.toString()) {
      return next(new AppError('Member not found in your group', 404));
    }

    // Remove from group members array
    group.members = group.members.filter(m => m.toString() !== memberId);
    await group.save();

    // Reset member's group/family info
    member.groupId = undefined;
    member.familyId = undefined; // Legacy
    member.status = 'active'; // Reset status
    await member.save();

    // Notify the removed member
    await Notification.create({
      recipient: member._id,
      sender: req.user._id,
      type: 'GROUP_REMOVE',
      title: 'Removed from Group',
      message: `You have been removed from the group ${group.name} by the admin.`,
      relatedEntityId: group._id
    });

    res.status(200).json({
      success: true,
      message: 'Member removed successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Join a group via group invite code
exports.joinGroup = async (req, res, next) => {
  try {
    const { inviteCode } = req.body;

    if (!inviteCode) {
      return next(new AppError('Please provide an invitation code', 400));
    }

    // Check if the user is already in a group
    if (req.user.groupId || req.user.familyId) {
      return next(new AppError('You are already part of a group', 400));
    }

    // Look for group or specific invitation
    // 1. Check Group reusable inviteCode
    let group = await Group.findOne({ inviteCode, status: 'active' });
    let adminId = null;

    if (group) {
      adminId = group.admin;
    } else {
      // 2. Check personal Invitation model
      const invitation = await require('../models/Invitation').findOne({
        inviteCode,
        status: 'sent'
      });

      if (!invitation || new Date() > invitation.expiresAt) {
        return next(new AppError('Invalid or expired invitation code', 400));
      }
      
      if (invitation.inviteeEmail !== req.user.email) {
         // Some groups might restrict to email, but let's allow it if they have the code for now,
         // or we can strictly enforce email matching. The prompt said "Enter Invitation Code" -> Join.
         // Let's enforce email matching if it's a personal invite.
         return next(new AppError('This invitation code was not sent to your email', 403));
      }

      adminId = invitation.admin;
      invitation.status = 'accepted';
      invitation.acceptedBy = req.user._id;
      await invitation.save();

      group = await Group.findOne({ admin: adminId });
    }

    if (!group && adminId) {
       // Create group if admin didn't have one
       const admin = await User.findById(adminId);
       group = await Group.create({
         name: `${admin.name}'s Financial Group`,
         admin: admin._id,
         members: []
       });
       await User.findByIdAndUpdate(adminId, { groupId: group._id });
    }

    if (!group) {
      return next(new AppError('Group could not be found', 404));
    }

    // Link user
    await User.findByIdAndUpdate(req.user._id, {
      familyId: adminId,
      groupId: group._id,
      invitedBy: adminId,
      relationship: 'child', // Default, they can change later or admin can change
      status: 'active',
      familyJoinDate: new Date()
    });

    if (!group.members.includes(req.user._id)) {
      group.members.push(req.user._id);
      await group.save();
    }

    // Notify Admin
    await Notification.create({
      recipient: adminId,
      sender: req.user._id,
      type: 'GROUP_JOIN',
      title: 'New Member Joined',
      message: `${req.user.name} has joined your group using an invitation code.`,
      relatedEntityId: req.user._id
    });

    res.status(200).json({
      success: true,
      message: 'You have successfully joined the group',
      group
    });

  } catch (error) {
    next(error);
  }
};

