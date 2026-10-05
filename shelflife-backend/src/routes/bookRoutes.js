const express = require('express');
const router = express.Router();
const { createBook, getBooks } = require('../controllers/bookController');
const authenticateLibrarian = require('../middleware/authMiddleware');
const validate = require('../middleware/validationMiddleware');
const {
  createBookSchema,
  listBooksQuerySchema,
} = require('../validators/bookValidator');

// GET /api/books - Publicly accessible list with pagination & genre filter
router.get('/', validate(listBooksQuerySchema, 'query'), getBooks);

// POST /api/books - Protected: Librarian only
router.post('/', authenticateLibrarian, validate(createBookSchema), createBook);

module.exports = router;
