export const healthController = {
  /**
   * GET /api/health controller
   * Returns API status and current timestamp in ISO format.
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  getHealth: (req, res) => {
    try {
      res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};
