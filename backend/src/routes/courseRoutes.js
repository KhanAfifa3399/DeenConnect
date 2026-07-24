const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const { createCourseRules, validate } = require('../validators/courseValidator');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

router.get('/', courseController.getCourses);
router.get('/:id', courseController.getCourseById);
router.post('/', authenticate, authorize('admin', 'teacher'), createCourseRules, validate, courseController.createCourse);
router.put('/:id', authenticate, authorize('admin', 'teacher'), createCourseRules, validate, courseController.updateCourse);
router.delete('/:id', authenticate, authorize('admin'), courseController.deleteCourse);

module.exports = router;