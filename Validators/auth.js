import { check } from 'express-validator';

export const registerValidator = [
  check('fullName').isString().notEmpty().withMessage('Full name is required'),

  check('email')
    .notEmpty()
    .withMessage('Email is required')
    .bail()
    .isString()
    .isEmail()
    .withMessage('Email must be valid'),

  check('password')
    .notEmpty()
    .isString()
    .withMessage('Password is required')
    .bail()
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
];
