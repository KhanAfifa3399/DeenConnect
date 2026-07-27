const express = require('express');
const router = express.Router();
const announcementController = require('../controllers/announcementController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

router.get('/', authenticate, announcementController.getAll);
router.post('/', authenticate, authorize('admin', 'teacher'), announcementController.create);
router.delete('/:id', authenticate, authorize('admin', 'teacher'), announcementController.remove);

module.exports = router;