const express = require('express');
const {
  createNotification,
  getUserNotifications,
  markNotificationAsRead,
  markAllAsRead,
} = require('../controller/Notification');

const router = express.Router();

router.post('/', createNotification);
router.get('/user/:userId', getUserNotifications);
router.get('/user', getUserNotifications); // fallback via email query
router.patch('/:notificationId/read', markNotificationAsRead);
router.patch('/user/:userId/read-all', markAllAsRead);
router.patch('/user/read-all', markAllAsRead); // fallback via email query

module.exports = router;

