const express = require('express');
const router = express.Router();
const enrollmentController = require('../controllers/enrollmentController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

router.post('/', authenticate, authorize('student'), enrollmentController.enrollInCourse);
router.get('/my', authenticate, authorize('student'), enrollmentController.getMyEnrollments);
router.get('/course/:courseId', authenticate, authorize('admin', 'teacher'), enrollmentController.getCourseEnrollments);

module.exports = router;