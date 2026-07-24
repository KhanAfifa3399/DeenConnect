const { body, validationResult } = require('express-validator');

const createCourseRules = [
    body('subject_id').notEmpty().withMessage('Subject is required').isInt().withMessage('Subject ID must be a number'),
    body('teacher_id').notEmpty().withMessage('Teacher is required').isInt().withMessage('Teacher ID must be a number'),
    body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 200 }),
    body('slug').trim().notEmpty().withMessage('Slug is required').matches(/^[a-z0-9-]+$/).withMessage('Slug must be lowercase letters, numbers, hyphens only'),
    body('description').optional().trim(),
    body('duration_months').notEmpty().withMessage('Duration in months is required').isInt({ min: 1 }).withMessage('Duration must be at least 1 month'),
    body('start_date').optional().isISO8601().withMessage('Start date must be a valid date (YYYY-MM-DD)'),
    body('end_date').optional().isISO8601().withMessage('End date must be a valid date (YYYY-MM-DD)'),
    body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
];

function validate(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
}

module.exports = { createCourseRules, validate };