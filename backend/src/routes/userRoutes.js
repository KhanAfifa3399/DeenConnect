const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { createUserRules, validate } = require('../validators/userValidator');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

router.get('/', authenticate, authorize('admin'), userController.getUsers);
router.get('/:id', authenticate, userController.getUserById);
router.post('/', authenticate, authorize('admin'), createUserRules, validate, userController.createUser);
router.put('/:id', authenticate, userController.updateUser);
router.delete('/:id', authenticate, authorize('admin'), userController.deleteUser);

module.exports = router;