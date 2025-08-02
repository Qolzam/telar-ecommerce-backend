import { validationResult } from 'express-validator';

export const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (errors.isEmpty()) {
    return next();
  }

  const formattedErrors = errors.array().map(error => ({
    field: error.path,
    message: error.msg
  }));

  return res.status(400).json({
    status: false,
    message: 'Validation failed',
    errors: formattedErrors
  });
};
