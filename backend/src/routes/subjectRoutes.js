const express = require('express');
const router = express.Router();
const subjectController = require('../controllers/subjectController');
const { createSubjectRules, validate } = require('../validators/subjectValidator');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

router.get('/', subjectController.getSubjects);
router.get('/:id', subjectController.getSubjectById);
router.post('/', authenticate, authorize('admin'), createSubjectRules, validate, subjectController.createSubject);
router.put('/:id', authenticate, authorize('admin'), createSubjectRules, validate, subjectController.updateSubject);
router.delete('/:id', authenticate, authorize('admin'), subjectController.deleteSubject);

module.exports = router;