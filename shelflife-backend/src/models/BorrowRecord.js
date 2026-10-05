const mongoose = require('mongoose');

const borrowRecordSchema = new mongoose.Schema(
  {
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      required: [true, 'Book reference is required'],
    },
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Member',
      required: [true, 'Member reference is required'],
    },
    issueDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
    },
    returnDate: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: {
        values: ['issued', 'returned', 'overdue'],
        message: '{VALUE} is not a valid borrow status',
      },
      required: true,
      default: 'issued',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes optimized for member borrowing history and overdue lookups
borrowRecordSchema.index({ member: 1, issueDate: -1 });
borrowRecordSchema.index({ book: 1, status: 1 });
borrowRecordSchema.index({ status: 1, dueDate: 1 });

const BorrowRecord = mongoose.model('BorrowRecord', borrowRecordSchema);

module.exports = BorrowRecord;
