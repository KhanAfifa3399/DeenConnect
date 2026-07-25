const express = require('express');
const router = express.Router();
const quranContentController = require('../controllers/quranContentController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const uploadPdf = require('../config/multerPdf');

router.get('/:type', quranContentController.getByType);
router.post('/', authenticate, authorize('admin'), uploadPdf.single('pdf'), quranContentController.upload);
router.delete('/:id', authenticate, authorize('admin'), quranContentController.remove);

module.exports = router;