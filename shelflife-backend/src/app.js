const express = require('express');
const cors = require('cors');
const requestLogger = require('./middleware/loggerMiddleware');
const { errorHandler, AppError } = require('./middleware/errorMiddleware');

// Route imports
const authRoutes = require('./routes/authRoutes');
const bookRoutes = require('./routes/bookRoutes');
const memberRoutes = require('./routes/memberRoutes');
const borrowRoutes = require('./routes/borrowRoutes');

const app = express();

// 1. Cross-Origin Resource Sharing (Ready for Q2 React frontend integration)
app.use(cors());

// 2. Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. Custom request logging middleware
app.use(requestLogger);

// 4. System Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'ShelfLife API is running',
  });
});

// 5. API Routes mounting
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/members', memberRoutes);

// Mount borrowRoutes directly under /api (providing /api/borrow and /api/return)
app.use('/api', borrowRoutes);

// Additional mounts to ensure exact match for /api/borrow and /api/return with or without trailing slash
app.use('/api/borrow', borrowRoutes);
app.use('/api/return', borrowRoutes);

// 6. Handle undefined routes
app.all('*', (req, res, next) => {
  next(new AppError(`Endpoint ${req.method} ${req.originalUrl} not found`, 404));
});

// 7. Centralized Error Handling Middleware (must be registered last)
app.use(errorHandler);

module.exports = app;
