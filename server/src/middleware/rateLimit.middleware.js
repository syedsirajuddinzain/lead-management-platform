const rateLimit = require('express-rate-limit');
const { rateLimit: rateLimitConfig, env } = require('../config/env');

// General API limiter
const apiLimiter = rateLimit({
  windowMs: rateLimitConfig.windowMs,
  max: rateLimitConfig.max,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => env === 'test',
  message: { success: false, statusCode: 429, message: 'Too many requests, please try again later' },
});

// Stricter limiter for auth endpoints to slow brute-force attempts
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: env === 'test' ? 1000 : 20,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => env === 'test',
  message: { success: false, statusCode: 429, message: 'Too many login attempts, please try again later' },
});

// Limiter for the public lead capture endpoint (anti-spam)
const publicLeadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: env === 'test' ? 1000 : 10,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => env === 'test',
  message: { success: false, statusCode: 429, message: 'Too many submissions, please try again later' },
});

module.exports = { apiLimiter, authLimiter, publicLeadLimiter };
