/**
 * GET /api/health controller
 * Returns API status and current timestamp in ISO format.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const healthController = {
  getHealth: (req, res, next) => {
    try {
      res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  }
};

export default healthController;
