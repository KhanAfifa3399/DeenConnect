const { body, validationResult } = require('express-validator');

const loginRules = [
    body('email').trim().notEmpty().withMessage('Email is required').isEmail().withMessage('Must be a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
];

const registerRules = [
    body('full_name')
        .trim()
        .notEmpty().withMessage('Full name is required')
        .isLength({ max: 150 }).withMessage('Full name must be 150 characters or fewer'),
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Must be a valid email address')
        .normalizeEmail(),
    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('phone')
        .optional()
        .trim(),
];

function validate(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
}

module.exports = { loginRules, registerRules, validate };