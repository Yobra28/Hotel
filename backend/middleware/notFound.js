export const notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    error: {
      message: `Route ${req.originalUrl} not found`,
      method: req.method,
      path: req.originalUrl,
      timestamp: new Date().toISOString()
    }
  });
};