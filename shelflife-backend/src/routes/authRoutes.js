const express = require('express');
const router = express.Router();
const { login } = require('../controllers/authController');
const validate = require('../middleware/validationMiddleware');
const { loginSchema } = require('../validators/authValidator');

// POST /api/auth/login - Public librarian login
router.post('/login', validate(loginSchema), login);

module.exports = router;
