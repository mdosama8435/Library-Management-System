const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { AppError } = require('../middleware/errorMiddleware');

/**
 * @desc    Authenticate librarian and return JWT
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find librarian by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return next(new AppError('Invalid email or password', 401));
    }

    // Compare hashed password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return next(new AppError('Invalid email or password', 401));
    }

    // Role check
    if (user.role !== 'librarian') {
      return next(new AppError('Access denied. Librarian role required.', 403));
    }

    // Generate JWT
    const secret = process.env.JWT_SECRET || 'shelflife_super_secret_jwt_key_2026';
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
      },
      secret,
      { expiresIn: '24h' }
    );

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
};
