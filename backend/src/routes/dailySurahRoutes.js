const express = require('express');
const router = express.Router();
const dailySurahController = require('../controllers/dailySurahController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

router.get('/', dailySurahController.getAll);
router.post('/', authenticate, authorize('admin'), dailySurahController.create);
router.delete('/:id', authenticate, authorize('admin'), dailySurahController.remove);

module.exports = router;