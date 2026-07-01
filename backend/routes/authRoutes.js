const express = require('express');
const router = express.Router();
const { registerUser, loginUser, logoutUser, getProfile } = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');
const { registerValidator, loginValidator } = require('../validators/authValidator');

router.post('/register', registerValidator, registerUser);
router.post('/login', loginValidator, loginUser);
router.post('/logout', logoutUser);
router.get('/me', verifyToken, getProfile);

module.exports = router;
