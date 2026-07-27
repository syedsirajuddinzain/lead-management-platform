const ApiError = require('../utils/ApiError');

/**
 * Generic request validator. Accepts a Zod schema shaped like
 * { body?, query?, params? } and validates the matching parts of req.
 */
const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse({
    body: req.body,
    query: req.query,
    params: req.params,
  });

  if (!result.success) {
    const details = result.error.issues.map((issue) => ({
      field: issue.path.slice(1).join('.') || issue.path.join('.'),
      message: issue.message,
    }));
    return next(ApiError.badRequest('Validation failed', details));
  }

  // Overwrite with parsed/coerced values
  if (result.data.body) req.body = result.data.body;
  if (result.data.query) req.validatedQuery = result.data.query;
  if (result.data.params) req.params = result.data.params;

  next();
};

module.exports = validate;
