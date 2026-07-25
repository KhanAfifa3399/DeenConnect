const express = require('express');
const router = express.Router();
const weekController = require('../controllers/weekController');

router.get('/course/:courseId', weekController.getWeeksByCourse);

module.exports = router;