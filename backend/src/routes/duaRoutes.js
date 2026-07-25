const express = require('express');
const router = express.Router();
const duaController = require('../controllers/duaController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

router.get('/', duaController.getAll);
router.post('/', authenticate, authorize('admin'), duaController.create);
router.put('/:id', authenticate, authorize('admin'), duaController.update);
router.delete('/:id', authenticate, authorize('admin'), duaController.remove);

module.exports = router;