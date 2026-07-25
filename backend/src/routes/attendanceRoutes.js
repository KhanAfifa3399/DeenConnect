const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

router.get('/session/:sessionId', authenticate, authorize('admin', 'teacher'), attendanceController.getSessionAttendance);
router.post('/', authenticate, authorize('admin', 'teacher'), attendanceController.markAttendance);

module.exports = router;