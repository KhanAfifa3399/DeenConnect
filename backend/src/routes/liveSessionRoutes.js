const express = require('express');
const router = express.Router();
const liveSessionController = require('../controllers/liveSessionController');
const { createSessionRules, validate } = require('../validators/liveSessionValidator');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

router.post('/', authenticate, authorize('admin', 'teacher'), createSessionRules, validate, liveSessionController.createSession);
router.get('/week/:weekId', authenticate, liveSessionController.getSessionsByWeek);
router.get('/my-upcoming', authenticate, authorize('student'), liveSessionController.getMyUpcomingSessions);
router.get('/my-upcoming-teacher', authenticate, authorize('teacher'), liveSessionController.getMyUpcomingSessionsForTeacher);
router.put('/:id/status', authenticate, authorize('admin', 'teacher'), liveSessionController.updateStatus);
router.delete('/:id', authenticate, authorize('admin', 'teacher'), liveSessionController.deleteSession);
router.get('/my-upcoming/teacher', authenticate, authorize('teacher'), liveSessionController.getMyUpcomingAsTeacher);

module.exports = router;