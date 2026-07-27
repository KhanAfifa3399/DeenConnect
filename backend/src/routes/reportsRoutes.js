const express = require('express');
const router = express.Router();
const reportsController = require('../controllers/reportsController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

router.get('/summary', authenticate, authorize('admin'), reportsController.getSummary);

module.exports = router;