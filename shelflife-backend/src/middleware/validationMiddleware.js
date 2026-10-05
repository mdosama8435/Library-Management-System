const { AppError } = require('./errorMiddleware');

/**
 * Higher-order middleware function to validate incoming request data against a Joi schema
 * @param {Object} schema - Joi schema
 * @param {string} property - 'body', 'query', or 'params'
 */
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: false,
    });

    if (error) {
      const errorMessages = error.details
        .map((detail) => detail.message.replace(/['"]/g, ''))
        .join('. ');
      return res.status(400).json({
        success: false,
        message: `Validation error: ${errorMessages}`,
      });
    }

    req[property] = value;
    next();
  };
};

module.exports = validate;
