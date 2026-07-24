const { body, validationResult } = require('express-validator');

const createSubjectRules = [
    body('name')
        .trim()
        .notEmpty().withMessage('Name is required')
        .isLength({ max: 100 }).withMessage('Name must be 100 characters or fewer'),
    body('slug')
        .trim()
        .notEmpty().withMessage('Slug is required')
        .matches(/^[a-z0-9-]+$/).withMessage('Slug can only contain lowercase letters, numbers, and hyphens'),
    body('description')
        .optional()
        .trim(),
];

function validate(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array(),
        });
    }
    next();
}

module.exports = { createSubjectRules, validate };