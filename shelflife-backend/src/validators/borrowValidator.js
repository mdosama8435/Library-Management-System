const Joi = require('joi');

const issueBookSchema = Joi.object({
  bookId: Joi.string()
    .hex()
    .length(24)
    .required()
    .messages({
      'string.hex': 'bookId must be a valid 24-character hexadecimal ObjectId',
      'string.length': 'bookId must be exactly 24 characters',
      'any.required': 'bookId is required',
    }),
  memberId: Joi.string()
    .hex()
    .length(24)
    .required()
    .messages({
      'string.hex': 'memberId must be a valid 24-character hexadecimal ObjectId',
      'string.length': 'memberId must be exactly 24 characters',
      'any.required': 'memberId is required',
    }),
  dueDate: Joi.date().iso().required().messages({
    'date.base': 'dueDate must be a valid ISO date',
    'date.format': 'dueDate must follow ISO 8601 format (e.g. YYYY-MM-DD)',
    'any.required': 'dueDate is required',
  }),
});

const returnBookSchema = Joi.object({
  borrowId: Joi.string()
    .hex()
    .length(24)
    .required()
    .messages({
      'string.hex': 'borrowId must be a valid 24-character hexadecimal ObjectId',
      'string.length': 'borrowId must be exactly 24 characters',
      'any.required': 'borrowId is required',
    }),
});

module.exports = {
  issueBookSchema,
  returnBookSchema,
};
