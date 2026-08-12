const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authenticate } = require('../middlewares/authMiddleware');

router.get('/my', authenticate, notificationController.getMyNotifications);
router.get('/unseen-count', authenticate, notificationController.getUnseenCount);
router.put('/mark-seen', authenticate, notificationController.markSeen);

module.exports = router;