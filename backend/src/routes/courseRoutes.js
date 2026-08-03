const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const { createCourseRules, validate } = require('../validators/courseValidator');
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const uploadCourseThumbnail = require('../config/multerCourseThumbnail');

router.get('/', courseController.getCourses);
router.get('/:id', courseController.getCourseById);
router.post('/', authenticate, authorize('admin', 'teacher'), createCourseRules, validate, courseController.createCourse);
router.put('/:id', authenticate, authorize('admin', 'teacher'), createCourseRules, validate, courseController.updateCourse);
router.put('/:id/thumbnail', authenticate, authorize('admin', 'teacher'), uploadCourseThumbnail.single('thumbnail'), courseController.uploadCourseThumbnail);
router.delete('/:id', authenticate, authorize('admin'), courseController.deleteCourse);
router.get('/my/assigned', authenticate, authorize('teacher'), courseController.getMyCourses);
// router.get('/teacher', authenticate, announcementController.getForTeacher);

module.exports = router;