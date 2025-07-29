import { check } from 'express-validator';

export const registerValidator = [
  check('fullName')
    .notEmpty()
    .withMessage('Full name is required')
    .bail()
    .isString()
    .withMessage('Full name must be a string'),

  check('email')
    .notEmpty()
    .withMessage('Email is required')
    .bail()
    .isString()
    .withMessage('Email must be a string')
    .bail()
    .isEmail()
    .withMessage('Email must be valid'),

  check('password')
    .notEmpty()
    .withMessage('Password is required')
    .bail()
    .isString()
    .withMessage('Password must be a string')
    .bail()
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
];
