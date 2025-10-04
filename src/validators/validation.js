/**
 * API Validation Utilities
 * Location: /validators/validation.js (root level)
 *
 * Provides validation schemas and utilities that match the API schema documentation.
 * Use these validators to ensure data consistency across the application.
 */

import { body, param, query, validationResult } from 'express-validator';

// =============================================================================
// USER VALIDATION
// =============================================================================

export const validateUserRegistration = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('fullName')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2-100 characters'),
  body('password')
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must be at least 8 characters with uppercase, lowercase, and number'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Passwords do not match');
    }
    return true;
  })
];

export const validateUserProfileUpdate = [
  body('fullName')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2-100 characters'),

  body('email').optional().isEmail().normalizeEmail().withMessage('Valid email is required'),

  body('password')
    .optional()
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must be at least 8 characters with uppercase, lowercase, and number')
];

export const validateUserLogin = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
];

export const validateForgotPassword = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required')
];

export const validateResetPassword = [
  body('token').isString().notEmpty().withMessage('Reset token is required'),
  body('password')
    .isString()
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters'),
  body('confirmPassword')
    .custom((v, { req }) => v === req.body.password)
    .withMessage('Passwords must match')
];

// =============================================================================
// PRODUCT VALIDATION
// =============================================================================

export const validateProductCreation = [
  body('name')
    .notEmpty()
    .isLength({ min: 1, max: 255 })
    .withMessage('Product name is required (1-255 characters)'),
  body('description')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('Description cannot exceed 2000 characters'),
  body('price').isFloat({ min: 0.01 }).withMessage('Price must be a positive number'),
  body('sku')
    .notEmpty()
    .matches(/^[A-Z0-9-_]+$/)
    .withMessage(
      'SKU is required and must contain only uppercase letters, numbers, hyphens, and underscores'
    ),
  body('stock').optional().isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
  body('categoryId').isInt({ min: 1 }).withMessage('Valid category ID is required'),
  body('images').optional().isArray().withMessage('Images must be an array of URLs'),
  body('images.*').optional().isURL().withMessage('Each image must be a valid URL'),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean')
];

export const validateProductUpdate = [
  param('id').isInt({ min: 1 }).withMessage('Valid product ID is required'),
  body('name')
    .optional()
    .isLength({ min: 1, max: 255 })
    .withMessage('Product name must be 1-255 characters'),
  body('description')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('Description cannot exceed 2000 characters'),
  body('price').optional().isFloat({ min: 0.01 }).withMessage('Price must be a positive number'),
  body('stock').optional().isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
  body('categoryId').optional().isInt({ min: 1 }).withMessage('Valid category ID is required'),
  body('images').optional().isArray().withMessage('Images must be an array of URLs'),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean')
];

export const validateProductFilters = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1-100'),
  query('categoryId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Category ID must be a positive integer'),
  query('minPrice').optional().isFloat({ min: 0 }).withMessage('Min price must be non-negative'),
  query('maxPrice').optional().isFloat({ min: 0 }).withMessage('Max price must be non-negative'),
  query('inStock').optional().isBoolean().withMessage('inStock must be a boolean'),
  query('search')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be 1-100 characters'),
  query('sortBy')
    .optional()
    .isIn(['name', 'price', 'createdAt', 'stock'])
    .withMessage('sortBy must be one of: name, price, createdAt, stock'),
  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('sortOrder must be asc or desc')
];

// =============================================================================
// CATEGORY VALIDATION
// =============================================================================

export const validateCategoryCreation = [
  body('name')
    .notEmpty()
    .isLength({ min: 1, max: 100 })
    .withMessage('Category name is required (1-100 characters)'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('slug')
    .optional()
    .matches(/^[a-z0-9-]+$/)
    .withMessage('Slug must contain only lowercase letters, numbers, and hyphens'),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean')
];

// =============================================================================
// CART VALIDATION
// =============================================================================

export const validateAddToCart = [
  body('productId').isInt({ min: 1 }).withMessage('Valid product ID is required'),
  body('quantity').isInt({ min: 1, max: 100 }).withMessage('Quantity must be between 1-100')
];

export const validateUpdateCartItem = [
  param('id').isInt({ min: 1 }).withMessage('Valid cart item ID is required'),
  body('quantity').isInt({ min: 1, max: 100 }).withMessage('Quantity must be between 1-100')
];

// =============================================================================
// ADDRESS VALIDATION
// =============================================================================

export const validateAddressCreation = [
  body('type')
    .isIn(['SHIPPING', 'BILLING'])
    .withMessage('Address type must be SHIPPING or BILLING'),
  body('firstName')
    .notEmpty()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name is required (1-50 characters)'),
  body('lastName')
    .notEmpty()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name is required (1-50 characters)'),
  body('company')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Company name cannot exceed 100 characters'),
  body('addressLine1')
    .notEmpty()
    .isLength({ min: 1, max: 200 })
    .withMessage('Address line 1 is required (1-200 characters)'),
  body('addressLine2')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Address line 2 cannot exceed 200 characters'),
  body('city')
    .notEmpty()
    .isLength({ min: 1, max: 100 })
    .withMessage('City is required (1-100 characters)'),
  body('state')
    .notEmpty()
    .isLength({ min: 1, max: 100 })
    .withMessage('State is required (1-100 characters)'),
  body('postalCode')
    .notEmpty()
    .matches(/^[A-Z0-9\s-]{3,20}$/i)
    .withMessage('Valid postal code is required'),
  body('country')
    .notEmpty()
    .isLength({ min: 2, max: 100 })
    .withMessage('Country is required (2-100 characters)'),
  body('phoneNumber')
    .optional()
    .matches(/^\+?[\d\s\-()]+$/)
    .withMessage('Valid phone number format required'),
  body('isDefault').optional().isBoolean().withMessage('isDefault must be a boolean')
];

// =============================================================================
// ORDER VALIDATION
// =============================================================================

export const validateCheckout = [
  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
  body('items.*.productId')
    .isInt({ min: 1 })
    .withMessage('Valid product ID is required for each item'),
  body('items.*.quantity')
    .isInt({ min: 1, max: 100 })
    .withMessage('Quantity must be between 1-100 for each item'),
  body('shippingAddress').notEmpty().withMessage('Shipping address is required'),
  body('paymentMethod').notEmpty().withMessage('Payment method is required'),
  body('paymentMethod.type')
    .isIn(['CREDIT_CARD', 'DEBIT_CARD', 'PAYPAL', 'STRIPE'])
    .withMessage('Valid payment method type is required')
];

// =============================================================================
// SEARCH VALIDATION
// =============================================================================

export const validateSearch = [
  query('query')
    .optional()
    .isLength({ min: 1, max: 200 })
    .withMessage('Search query must be 1-200 characters'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1-50')
];

// =============================================================================
// PAGINATION VALIDATION
// =============================================================================

export const validatePagination = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer').toInt(),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1-100')
    .toInt()
];

// =============================================================================
// ID PARAMETER VALIDATION
// =============================================================================

export const validateIdParam = [
  param('id').isInt({ min: 1 }).withMessage('Valid ID is required').toInt()
];

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Extracts validation errors from express-validator
 */
export const getValidationErrors = errors => {
  return errors.map(error => ({
    field: error.path || error.param,
    message: error.msg
  }));
};

/**
 * Standard validation error response
 */
export const validationErrorResponse = errors => ({
  status: false,
  message: 'Validation failed',
  errors: getValidationErrors(errors)
});

/**
 * Middleware to handle validation errors
 */
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json(validationErrorResponse(errors.array()));
  }

  next();
};
