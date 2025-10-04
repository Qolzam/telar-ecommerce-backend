export const errorHandler = (error, req, res, next) => {
  const code = error.statusCode || res.statusCode || 500;

  // Set status code if not already set
  if (res.headersSent) {
    return next(error);
  }

  res.status(code).json({
    error: true,
    code,
    message: error.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
};
