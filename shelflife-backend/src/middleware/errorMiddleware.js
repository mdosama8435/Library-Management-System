/**
 * Custom application error class for operational errors
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Centralized error handling middleware for ShelfLife API
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';

  // 1. Mongoose Validation Error (e.g. required fields, min/max constraints)
  if (err.name === 'ValidationError') {
    statusCode = 400;
    const errors = Object.values(err.errors).map((el) => el.message);
    message = `Validation failed: ${errors.join('. ')}`;
  }

  // 2. MongoDB Duplicate Key Error (Code 11000)
  if (err.code === 11000) {
    statusCode = 409;
    const keys = Object.keys(err.keyValue || {});
    const key = keys.length > 0 ? keys[0] : 'field';
    const value = err.keyValue ? err.keyValue[key] : '';
    message = `Duplicate field value: ${key} '${value}' already exists. Please use another value.`;
  }

  // 3. Mongoose Invalid ObjectId (CastError)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}: '${err.value}' is not a valid identifier`;
  }

  // 4. JWT Authentication Errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authentication token. Please log in again.';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Authentication token expired. Please log in again.';
  }

  // Consistent JSON response format
  const response = {
    success: false,
    message,
  };

  // Only include stack trace if explicitly in development and not in production
  if (process.env.NODE_ENV === 'development' && statusCode === 500) {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

module.exports = {
  AppError,
  errorHandler,
};
