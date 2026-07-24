const { body, validationResult } = require('express-validator');

const createSessionRules = [
    body('week_id').notEmpty().withMessage('Week is required').isInt().withMessage('week_id must be a number'),
    body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 200 }),
    body('description').optional().trim(),
    body('meeting_platform').optional().trim().isLength({ max: 50 }),
    body('meeting_link').trim().notEmpty().withMessage('Meeting link is required').isURL().withMessage('Must be a valid URL'),
    body('scheduled_at').notEmpty().withMessage('Scheduled time is required').isISO8601().withMessage('Must be a valid date/time'),
    body('duration_minutes').optional().isInt({ min: 1 }).withMessage('Duration must be a positive number'),
];

function validate(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
}

module.exports = { createSessionRules, validate };