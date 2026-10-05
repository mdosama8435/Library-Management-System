const Joi = require('joi');

const createMemberSchema = Joi.object({
  name: Joi.string().trim().min(1).required().messages({
    'string.empty': 'Member name cannot be empty',
    'any.required': 'Member name is required',
  }),
  email: Joi.string().trim().email().required().messages({
    'string.empty': 'Email cannot be empty',
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
  }),
  membershipId: Joi.string().trim().min(1).required().messages({
    'string.empty': 'Membership ID cannot be empty',
    'any.required': 'Membership ID is required',
  }),
});

const memberIdParamSchema = Joi.object({
  memberId: Joi.string()
    .hex()
    .length(24)
    .required()
    .messages({
      'string.hex': 'Member ID must be a valid 24-character hexadecimal ObjectId',
      'string.length': 'Member ID must be exactly 24 characters',
      'any.required': 'Member ID is required',
    }),
});

module.exports = {
  createMemberSchema,
  memberIdParamSchema,
};
