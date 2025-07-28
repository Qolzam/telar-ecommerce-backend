import { check } from 'express-validator';

export const registerValidator = [
  check('fullName').notEmpty().withMessage('Full name is required'),

  check('email')
    .notEmpty()
    .withMessage('Email is required')
    .bail()
    .isEmail()
    .withMessage('Email must be valid'),

  check('password')
    .notEmpty()
    .withMessage('Password is required')
    .bail()
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
];
