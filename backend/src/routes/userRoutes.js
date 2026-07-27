const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { createUserRules, validate } = require('../validators/userValidator');
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const uploadImage = require('../config/multerImage');
// ...
router.get('/', authenticate, authorize('admin'), userController.getUsers);
router.get('/:id', authenticate, userController.getUserById);
router.post('/', authenticate, authorize('admin'), createUserRules, validate, userController.createUser);
router.put('/:id', authenticate, userController.updateUser);
router.delete('/:id', authenticate, authorize('admin'), userController.deleteUser);
router.put('/me/password', authenticate, userController.changePassword);
router.put('/me/photo', authenticate, uploadImage.single('photo'), userController.uploadPhoto);

module.exports = router;