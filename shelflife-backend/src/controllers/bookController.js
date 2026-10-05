const Book = require('../models/Book');
const { AppError } = require('../middleware/errorMiddleware');

/**
 * @desc    Create a new book record
 * @route   POST /api/books
 * @access  Protected (Librarian only)
 */
const createBook = async (req, res, next) => {
  try {
    const { title, author, ISBN, genre, totalCopies, availableCopies } = req.body;

    // Check for duplicate ISBN beforehand for a clear conflict message
    const formattedISBN = ISBN.trim().toUpperCase();
    const existingBook = await Book.findOne({ ISBN: formattedISBN });
    if (existingBook) {
      return next(
        new AppError(`A book with ISBN '${formattedISBN}' already exists`, 409)
      );
    }

    const book = await Book.create({
      title: title.trim(),
      author: author.trim(),
      ISBN: formattedISBN,
      genre: genre.trim(),
      totalCopies,
      availableCopies,
    });

    res.status(201).json({
      success: true,
      data: book,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    List books with pagination and optional genre filtering
 * @route   GET /api/books
 * @access  Public
 */
const getBooks = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit, 10) || 10));
    const { genre } = req.query;

    const filter = {};
    if (genre && genre.trim() !== '') {
      // Case-insensitive exact genre match
      filter.genre = { $regex: new RegExp(`^${genre.trim()}$`, 'i') };
    }

    const total = await Book.countDocuments(filter);
    const totalPages = Math.ceil(total / limit) || 1;
    const skip = (page - 1) * limit;

    const books = await Book.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    res.status(200).json({
      success: true,
      data: books,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBook,
  getBooks,
};
