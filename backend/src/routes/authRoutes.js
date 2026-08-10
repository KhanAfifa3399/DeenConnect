const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { loginRules, registerRules, validate } = require('../validators/authValidator');

router.post('/register', registerRules, validate, authController.register);
router.post('/login', loginRules, validate, authController.login);
router.post('/register/teacher', registerRules, validate, authController.registerTeacher);

module.exports = router;