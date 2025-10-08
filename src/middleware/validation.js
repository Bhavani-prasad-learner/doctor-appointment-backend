const { body, validationResult } = require('express-validator');
const { ROLES } = require('../utils/constants');

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
};

exports.validateRegistration = [
    body('firstName')
        .trim()
        .notEmpty().withMessage('First name is required.'),
    body('lastName')
        .trim()
        .notEmpty().withMessage('Last name is required.'),
    body('email')
        .isEmail().withMessage('Please provide a valid email address.')
        .normalizeEmail(),
    body('password')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long.'),
    body('role')
        .isIn([ROLES.PATIENT, ROLES.DOCTOR, ROLES.ADMIN]).withMessage('Invalid user role.'),
    body('specialization')
        .if(body('role').equals(ROLES.DOCTOR))
        .notEmpty().withMessage('Specialization is required for doctors.'),
    handleValidationErrors
];

exports.validateLogin = [
    body('email')
        .isEmail().withMessage('Please provide a valid email address.')
        .normalizeEmail(),
    body('password')
        .notEmpty().withMessage('Password is required.'),
    handleValidationErrors
];