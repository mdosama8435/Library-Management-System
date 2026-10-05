const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { AppError } = require('./errorMiddleware');

/**
 * Middleware to protect routes that require librarian authentication.
 * Reads 'Authorization: Bearer <token>' header, verifies JWT, and attaches user to req.user.
 */
const authenticateLibrarian = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(
        new AppError('Authentication required. Missing Bearer token.', 401)
      );
    }

    // Verify token
    const secret = process.env.JWT_SECRET || 'shelflife_super_secret_jwt_key_2026';
    let decoded;
    try {
      decoded = jwt.verify(token, secret);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return next(new AppError('Token has expired. Please log in again.', 401));
      }
      return next(new AppError('Invalid authentication token.', 401));
    }

    // Verify that the user still exists in the database
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return next(
        new AppError('User belonging to this token no longer exists.', 401)
      );
    }

    // Verify librarian role
    if (user.role !== 'librarian') {
      return next(
        new AppError('Access denied. Librarian role required.', 403)
      );
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = authenticateLibrarian;
