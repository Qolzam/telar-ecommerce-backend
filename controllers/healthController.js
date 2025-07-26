// Controller to handle the GET /api/health endpoint
export const healthCheck = (req, res) => {
  try {
    res.status(200).json({
      // Send a 200 OK response with status and timestamp
      status: 'ok',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    // On error, send 500 Internal Server Error with a generic message
    res.status(500).json({ error: 'Internal server error' });
  }
};
