const express = require('express');
const router = express.Router();
const { getAllUsers, getUserStats } = require('../controllers/userController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

router.use(verifyToken);
router.use(authorizeRoles('admin'));

router.get('/', getAllUsers);
router.get('/stats', getUserStats);

module.exports = router;
