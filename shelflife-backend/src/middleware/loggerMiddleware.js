/**
 * Request logger middleware
 * Logs HTTP method, URL, timestamp, response status, and duration
 */
const requestLogger = (req, res, next) => {
  const start = Date.now();
  const timestamp = new Date().toISOString();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const { method, originalUrl } = req;
    const { statusCode } = res;

    // Format: [timestamp] METHOD URL STATUS - DURATIONms
    console.log(`[${timestamp}] ${method} ${originalUrl} ${statusCode} - ${duration}ms`);
  });

  next();
};

module.exports = requestLogger;
