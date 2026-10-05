const mongoose = require('mongoose');
const Book = require('../models/Book');
const Member = require('../models/Member');
const BorrowRecord = require('../models/BorrowRecord');
const { AppError } = require('../middleware/errorMiddleware');

/*
 * =========================================================================
 * CONCURRENCY / RACE CONDITION PREVENTION (EXAM REQUIREMENT):
 * To prevent two librarians from issuing the last copy simultaneously, we use
 * MongoDB's atomic findOneAndUpdate with condition { availableCopies: { $gt: 0 } }
 * and update { $inc: { availableCopies: -1 } }.
 * Because MongoDB document modifications are strictly atomic, only one concurrent
 * request successfully decrements the copy; the other receives null and is safely rejected.
 * A database transaction guarantees atomicity between the Book update and BorrowRecord creation.
 * =========================================================================
 */

/**
 * Helper to determine whether the active MongoDB deployment supports transactions.
 * Transactions in MongoDB require a Replica Set (or Sharded Cluster). Single standalone
 * nodes throw 'Transaction numbers are only allowed on a replica set member or mongos'.
 */
const canUseTransactions = () => {
  const type = mongoose.connection?.client?.topology?.description?.type;
  return type === 'ReplicaSetWithPrimary' || type === 'Sharded';
};

/**
 * @desc    Issue a book to a member
 * @route   POST /api/borrow
 * @access  Protected (Librarian only)
 */
const issueBook = async (req, res, next) => {
  const { bookId, memberId, dueDate } = req.body;

  // 1. Verify Member exists
  const member = await Member.findById(memberId);
  if (!member) {
    return next(new AppError('Member not found', 404));
  }

  // 2. Verify Book exists
  const book = await Book.findById(bookId);
  if (!book) {
    return next(new AppError('Book not found', 404));
  }

  // Check if session-based transactions can be used
  const useTransaction = canUseTransactions();
  let session = null;

  try {
    if (useTransaction) {
      session = await mongoose.startSession();
      session.startTransaction();
    }

    const sessionOpt = session ? { session } : {};

    // 3. Concurrency-safe atomic decrement:
    // Only decrements if availableCopies > 0 at execution time
    const updatedBook = await Book.findOneAndUpdate(
      {
        _id: bookId,
        availableCopies: { $gt: 0 },
      },
      {
        $inc: { availableCopies: -1 },
      },
      {
        new: true,
        runValidators: true,
        ...sessionOpt,
      }
    );

    // If updatedBook is null, no copy was available
    if (!updatedBook) {
      if (session) {
        await session.abortTransaction();
        session.endSession();
      }
      return next(
        new AppError('No copies available for this book to borrow', 400)
      );
    }

    // 4. Create BorrowRecord
    const borrowRecordData = {
      book: bookId,
      member: memberId,
      issueDate: new Date(),
      dueDate: new Date(dueDate),
      status: 'issued',
    };

    let borrowRecord;
    if (session) {
      const records = await BorrowRecord.create([borrowRecordData], { session });
      borrowRecord = records[0];
      await session.commitTransaction();
      session.endSession();
    } else {
      try {
        borrowRecord = await BorrowRecord.create(borrowRecordData);
      } catch (createErr) {
        // Compensating rollback for standalone MongoDB: restore availableCopies if creation failed
        await Book.updateOne({ _id: bookId }, { $inc: { availableCopies: 1 } });
        throw createErr;
      }
    }

    // Populate book and member references for response
    await borrowRecord.populate([
      { path: 'book', select: 'title author ISBN genre' },
      { path: 'member', select: 'name email membershipId' },
    ]);

    res.status(201).json({
      success: true,
      data: borrowRecord,
    });
  } catch (error) {
    if (session) {
      try {
        await session.abortTransaction();
        session.endSession();
      } catch (e) {
        // Ignore session cleanup errors
      }
    }
    next(error);
  }
};

/**
 * @desc    Return a borrowed book
 * @route   POST /api/return or POST /api/return/:borrowId
 * @access  Protected (Librarian only)
 */
const returnBook = async (req, res, next) => {
  const borrowId = req.params.borrowId || req.body.borrowId;

  if (!borrowId) {
    return next(new AppError('borrowId is required in URL or request body', 400));
  }

  // Verify borrowId is a valid ObjectId
  if (!mongoose.Types.ObjectId.isValid(borrowId)) {
    return next(new AppError(`Invalid borrowId: '${borrowId}'`, 400));
  }

  // 1. Find BorrowRecord
  const record = await BorrowRecord.findById(borrowId);
  if (!record) {
    return next(new AppError('Borrow record not found', 404));
  }

  // 2. Ensure the record has not already been returned
  if (record.status === 'returned') {
    return next(new AppError('Book has already been returned', 400));
  }

  const useTransaction = canUseTransactions();
  let session = null;

  try {
    if (useTransaction) {
      session = await mongoose.startSession();
      session.startTransaction();
    }

    const sessionOpt = session ? { session } : {};

    // 3. Atomically update BorrowRecord to 'returned' with current returnDate
    // The query condition status: { $ne: 'returned' } prevents duplicate return operations
    const updatedBorrowRecord = await BorrowRecord.findOneAndUpdate(
      {
        _id: borrowId,
        status: { $ne: 'returned' },
      },
      {
        $set: {
          returnDate: new Date(),
          status: 'returned',
        },
      },
      {
        new: true,
        runValidators: true,
        ...sessionOpt,
      }
    );

    if (!updatedBorrowRecord) {
      if (session) {
        await session.abortTransaction();
        session.endSession();
      }
      return next(new AppError('Book has already been returned', 400));
    }

    // 4. Safely increment Book.availableCopies (do not allow availableCopies > totalCopies)
    const updatedBook = await Book.findOneAndUpdate(
      {
        _id: updatedBorrowRecord.book,
        $expr: { $lt: ['$availableCopies', '$totalCopies'] },
      },
      {
        $inc: { availableCopies: 1 },
      },
      {
        new: true,
        runValidators: true,
        ...sessionOpt,
      }
    );

    if (!updatedBook) {
      // Revert borrow record if book copies could not be incremented
      if (session) {
        await session.abortTransaction();
        session.endSession();
      } else {
        await BorrowRecord.updateOne(
          { _id: borrowId },
          { $set: { status: record.status, returnDate: record.returnDate } }
        );
      }
      return next(
        new AppError(
          'Cannot return book: available copies cannot exceed total copies',
          400
        )
      );
    }

    if (session) {
      await session.commitTransaction();
      session.endSession();
    }

    // Populate book and member info for clear API response
    await updatedBorrowRecord.populate([
      { path: 'book', select: 'title author ISBN genre totalCopies availableCopies' },
      { path: 'member', select: 'name email membershipId' },
    ]);

    res.status(200).json({
      success: true,
      data: updatedBorrowRecord,
    });
  } catch (error) {
    if (session) {
      try {
        await session.abortTransaction();
        session.endSession();
      } catch (e) {
        // Ignore session cleanup errors
      }
    }
    next(error);
  }
};

module.exports = {
  issueBook,
  returnBook,
};
