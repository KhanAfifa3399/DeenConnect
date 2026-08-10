const express = require('express');
const router = express.Router();
const lectureController = require('../controllers/lectureController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const upload = require('../config/multer');

router.get('/week/:weekId',authenticate, lectureController.getLecturesByWeek);
router.get('/missing-videos/my', authenticate, authorize('teacher'), lectureController.getMissingVideosForTeacher);
router.post('/', authenticate, authorize('admin', 'teacher'), upload.single('video'), lectureController.createLecture);
router.delete('/:id', authenticate, authorize('admin', 'teacher'), lectureController.deleteLecture);
router.put('/:id', authenticate, authorize('admin', 'teacher'), lectureController.updateLecture);
router.get('/missing-videos/teacher', authenticate, authorize('teacher'), lectureController.getMyMissingVideos);

module.exports = router;