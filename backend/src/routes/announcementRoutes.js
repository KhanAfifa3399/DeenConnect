const express = require('express');
const router = express.Router();
const announcementController = require('../controllers/announcementController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

router.get('/student', authenticate, announcementController.getForStudent);
router.get('/teacher', authenticate, announcementController.getForTeacher);
router.get('/mine', authenticate, announcementController.getMine);
router.get('/', authenticate, announcementController.getAll);
router.post('/', authenticate, authorize('admin', 'teacher'), announcementController.create);
router.put('/:id', authenticate, authorize('admin', 'teacher'), announcementController.update);
router.delete('/:id', authenticate, authorize('admin', 'teacher'), announcementController.remove);

module.exports = router;