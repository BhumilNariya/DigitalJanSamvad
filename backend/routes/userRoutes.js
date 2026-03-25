const express = require('express');
const { getUserProfile } = require('../controllers/userController');
const { getNotifications, markAsRead, markAllAsRead } = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.route('/me').get(protect, getUserProfile);
router.route('/notifications').get(protect, getNotifications);
router.route('/notifications/read-all').patch(protect, markAllAsRead);
router.route('/notifications/:id/read').patch(protect, markAsRead);

module.exports = router;
