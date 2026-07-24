const express = require('express');
const router = express.Router();
const { 
  getAllUsers, 
  getUserStats, 
  getFamilyMembers, 
  getMemberExpenses, 
  sendInvitation, 
  getPendingInvitations, 
  getInvitationDetails,
  getMyInvitation,
  acceptInvitation,
  updateProfile,
  updatePassword,
  deleteAccount
} = require('../controllers/userController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

// Public route to get invitation details by inviteCode (used on register screen)
router.get('/invitations/:code', getInvitationDetails);

// Protect all routes below
router.use(verifyToken);

// User routes — any logged-in user
router.get('/my-invitation', getMyInvitation);
router.post('/accept-invitation', acceptInvitation);

// Profile routes
router.put('/profile', updateProfile);
router.put('/password', updatePassword);
router.delete('/account', deleteAccount);

// Admin-only routes
router.use(authorizeRoles('admin'));
router.get('/', getAllUsers);
router.get('/stats', getUserStats);

// Family Members & Invitations routes
router.get('/family', getFamilyMembers);
router.get('/family/:memberId/expenses', getMemberExpenses);
router.post('/invite', sendInvitation);
router.get('/invitations', getPendingInvitations);

module.exports = router;

