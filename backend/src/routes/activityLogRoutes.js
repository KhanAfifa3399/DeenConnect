const express = require('express');
const router = express.Router();
const activityLogController = require('../controllers/activityLogController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

router.get('/', authenticate, authorize('admin'), activityLogController.getRecent);
router.get('/notifications', authenticate, activityLogController.getNotifications);

module.exports = router;