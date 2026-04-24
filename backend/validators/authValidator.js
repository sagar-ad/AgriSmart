const { body, param, query, validationResult } = require('express-validator');

/**
 * Validation Middleware
 * Checks for validation errors and returns them
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors: errors.array()
    });
  }
  next();
};

/**
 * Auth Validation Rules
 */
const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
  validate
];

const registerValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('name').notEmpty().trim().withMessage('Name is required'),
  body('role').isIn(['super_admin', 'admin', 'farmer']).withMessage('Valid role is required'),
  body('phone').optional().isMobilePhone().withMessage('Valid phone number is required'),
  validate
];

/**
 * User Validation Rules
 */
const userValidation = [
  body('email').optional().isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('name').optional().notEmpty().trim().withMessage('Name cannot be empty'),
  body('role').optional().isIn(['super_admin', 'admin', 'farmer']).withMessage('Valid role is required'),
  body('phone').optional().isMobilePhone().withMessage('Valid phone number is required'),
  body('location').optional().trim(),
  validate
];

/**
 * Crop Validation Rules
 */
const cropValidation = [
  body('name').notEmpty().trim().withMessage('Crop name is required'),
  body('variety').optional().trim(),
  body('description').optional().trim(),
  validate
];

/**
 * Schedule Template Validation Rules
 */
const scheduleTemplateValidation = [
  body('crop_id').isInt({ min: 1 }).withMessage('Valid crop ID is required'),
  body('task_name').notEmpty().trim().withMessage('Task name is required'),
  body('days_after_sowing').isInt({ min: 0 }).withMessage('DAS must be a positive integer'),
  body('instructions').optional().trim(),
  validate
];

/**
 * Farmer Crop Assignment Validation Rules
 */
const farmerCropValidation = [
  body('farmer_id').isInt({ min: 1 }).withMessage('Valid farmer ID is required'),
  body('crop_id').isInt({ min: 1 }).withMessage('Valid crop ID is required'),
  body('sowing_date').isISO8601().withMessage('Valid sowing date is required'),
  validate
];

/**
 * Task Validation Rules
 */
const taskValidation = [
  body('task_name').optional().notEmpty().trim(),
  body('due_date').optional().isISO8601(),
  body('status').optional().isIn(['pending', 'done']),
  body('instructions').optional().trim(),
  validate
];

const taskCompletionValidation = [
  body('completion_note').optional().trim(),
  body('completion_photo').optional().trim(),
  validate
];

module.exports = {
  validate,
  loginValidation,
  registerValidation,
  userValidation,
  cropValidation,
  scheduleTemplateValidation,
  farmerCropValidation,
  taskValidation,
  taskCompletionValidation
};