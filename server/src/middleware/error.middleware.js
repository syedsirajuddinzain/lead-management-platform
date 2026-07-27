const ApiError = require('../utils/ApiError');
const { env } = require('../config/env');

/* eslint-disable no-unused-vars */

/**
 * Normalizes known error types (Mongoose validation/cast/duplicate-key,
 * JWT errors, ApiError) into a consistent JSON error response.
 * Must be registered last, after all routes.
 */
function errorHandler(err, req, res, next) {
  let error = err;

  if (!(error instanceof ApiError)) {
    if (error.name === 'ValidationError') {
      // Mongoose schema validation error
      const details = Object.values(error.errors).map((e) => ({ field: e.path, message: e.message }));
      error = ApiError.badRequest('Validation failed', details);
    } else if (error.name === 'CastError') {
      error = ApiError.badRequest(`Invalid value for field: ${error.path}`);
    } else if (error.code === 11000) {
      const field = Object.keys(error.keyValue || {}).join(', ');
      error = ApiError.conflict(`Duplicate value for field: ${field}`);
    } else {
      error = new ApiError(error.statusCode || 500, error.message || 'Internal server error');
    }
  }

  if (env !== 'test' && !error.isOperational) {
    // eslint-disable-next-line no-console
    console.error('[unexpected error]', err);
  }

  const response = {
    success: false,
    statusCode: error.statusCode,
    message: error.message,
  };

  if (error.details) response.details = error.details;
  if (env === 'development' && err.stack) response.stack = err.stack;

  res.status(error.statusCode).json(response);
}

function notFoundHandler(req, res, next) {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
}

module.exports = { errorHandler, notFoundHandler };
