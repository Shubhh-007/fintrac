const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', notificationController.getNotifications);
router.put('/read-all', notificationController.markAllAsRead);
router.route('/:id')
  .put(notificationController.markAsRead)
  .delete(notificationController.deleteNotification);

module.exports = router;
