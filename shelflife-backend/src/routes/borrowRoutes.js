const express = require('express');
const router = express.Router();
const { issueBook, returnBook } = require('../controllers/borrowController');
const authenticateLibrarian = require('../middleware/authMiddleware');
const validate = require('../middleware/validationMiddleware');
const {
  issueBookSchema,
} = require('../validators/borrowValidator');

// POST /api/borrow - Issue a book to a member (Protected: Librarian only)
router.post('/borrow', authenticateLibrarian, validate(issueBookSchema), issueBook);

// POST /api/return and POST /api/return/:borrowId - Return a borrowed book (Protected: Librarian only)
router.post('/return', authenticateLibrarian, returnBook);
router.post('/return/:borrowId', authenticateLibrarian, returnBook);

// Support direct mount at /api/borrow
router.post('/', authenticateLibrarian, validate(issueBookSchema), issueBook);

module.exports = router;
