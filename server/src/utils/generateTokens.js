const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const env = require('../config/env');

function signToken(payload, secret, expiresIn) {
  return jwt.sign(payload, secret, { expiresIn });
}

function generateAccessToken(user) {
  return signToken(
    { sub: String(user._id), role: user.role },
    env.jwtAccessSecret,
    env.accessTokenExpires
  );
}

function generateRefreshToken(user) {
  return signToken(
    { sub: String(user._id), role: user.role },
    env.jwtRefreshSecret,
    env.refreshTokenExpires
  );
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function refreshCookieOptions() {
  const maxAgeMs = 7 * 24 * 60 * 60 * 1000;
  return {
    httpOnly: true,
    secure: env.isProd,
    sameSite: 'strict',
    path: '/',
    maxAge: maxAgeMs,
  };
}

function clearRefreshCookieOptions() {
  return {
    httpOnly: true,
    secure: env.isProd,
    sameSite: 'strict',
    path: '/',
  };
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
  refreshCookieOptions,
  clearRefreshCookieOptions,
};