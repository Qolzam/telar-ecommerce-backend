export const errorHandler = (error, req, res) => {
  const code = res.code ? res.code : 500;
  res.status(code).json({ code, status: false, message: error.message, stack: error.stack });
};
