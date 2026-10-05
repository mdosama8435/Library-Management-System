const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Book title is required'],
      trim: true,
    },
    author: {
      type: String,
      required: [true, 'Author is required'],
      trim: true,
    },
    ISBN: {
      type: String,
      required: [true, 'ISBN is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    genre: {
      type: String,
      required: [true, 'Genre is required'],
      trim: true,
    },
    totalCopies: {
      type: Number,
      required: [true, 'Total copies is required'],
      min: [1, 'Total copies must be at least 1'],
      validate: {
        validator: Number.isInteger,
        message: '{VALUE} is not an integer value for totalCopies',
      },
    },
    availableCopies: {
      type: Number,
      required: [true, 'Available copies is required'],
      min: [0, 'Available copies cannot be negative'],
      validate: [
        {
          validator: Number.isInteger,
          message: '{VALUE} is not an integer value for availableCopies',
        },
        {
          validator: function (value) {
            // Check that availableCopies does not exceed totalCopies
            if (this.totalCopies !== undefined && value > this.totalCopies) {
              return false;
            }
            return true;
          },
          message: 'Available copies cannot be greater than total copies',
        },
      ],
    },
  },
  {
    timestamps: true,
  }
);

// ISBN unique index is already defined via unique: true in schema
const Book = mongoose.model('Book', bookSchema);

module.exports = Book;
