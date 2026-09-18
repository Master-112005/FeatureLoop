const rateLimit = require('express-rate-limit');

const message = { error: 'Too many requests, please try again later.', code: 'RATE_LIMITED' };

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 600,
  standardHeaders: true,
  legacyHeaders: false,
  message,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message,
});

const upvoteLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message,
});

module.exports = { apiLimiter, authLimiter, upvoteLimiter };