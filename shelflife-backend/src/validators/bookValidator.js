const Joi = require('joi');

const createBookSchema = Joi.object({
  title: Joi.string().trim().min(1).required().messages({
    'string.empty': 'Book title cannot be empty',
    'any.required': 'Book title is required',
  }),
  author: Joi.string().trim().min(1).required().messages({
    'string.empty': 'Author cannot be empty',
    'any.required': 'Author is required',
  }),
  ISBN: Joi.string().trim().min(3).max(20).required().messages({
    'string.empty': 'ISBN cannot be empty',
    'any.required': 'ISBN is required',
  }),
  genre: Joi.string().trim().min(1).required().messages({
    'string.empty': 'Genre cannot be empty',
    'any.required': 'Genre is required',
  }),
  totalCopies: Joi.number().integer().min(1).required().messages({
    'number.base': 'totalCopies must be a number',
    'number.integer': 'totalCopies must be an integer',
    'number.min': 'totalCopies must be at least 1',
    'any.required': 'totalCopies is required',
  }),
  availableCopies: Joi.number()
    .integer()
    .min(0)
    .max(Joi.ref('totalCopies'))
    .required()
    .messages({
      'number.base': 'availableCopies must be a number',
      'number.integer': 'availableCopies must be an integer',
      'number.min': 'availableCopies cannot be negative',
      'number.max': 'availableCopies cannot exceed totalCopies',
      'any.required': 'availableCopies is required',
    }),
});

const listBooksQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  genre: Joi.string().trim().optional(),
});

module.exports = {
  createBookSchema,
  listBooksQuerySchema,
};
