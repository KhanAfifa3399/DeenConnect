const express = require('express');
const router = express.Router();
const lectureController = require('../controllers/lectureController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const upload = require('../config/multer');

router.get('/week/:weekId', lectureController.getLecturesByWeek);
router.post('/', authenticate, authorize('admin', 'teacher'), upload.single('video'), lectureController.createLecture);
router.delete('/:id', authenticate, authorize('admin', 'teacher'), lectureController.deleteLecture);

module.exports = router;