const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .post(groupController.createGroup)
  .put(groupController.updateGroup);

router.get('/my-group', groupController.getMyGroup);
router.post('/join', groupController.joinGroup);
router.delete('/members/:memberId', groupController.removeMember);

module.exports = router;
