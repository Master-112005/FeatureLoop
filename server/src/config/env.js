const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const required = ['JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET', 'ADMIN_SIGNUP_PASSWORD'];
for (const key of required) {
  if (!process.env[key]) {
    console.warn(`[env] Missing required env var: ${key}`);
  }
}

const isProd = String(process.env.NODE_ENV).trim() === 'production';

const env = {
  port: Number(process.env.PORT) || 5000,
  mongoUri:
    process.env.MONGO_URI || 'mongodb://localhost:27017/feature-roadmap-portal',
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  nodeEnv: process.env.NODE_ENV || 'development',
  isProd,
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET || 'dev_access_secret',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret',
  adminSignupPassword: process.env.ADMIN_SIGNUP_PASSWORD || '',
  accessTokenExpires: process.env.ACCESS_TOKEN_EXPIRES || '15m',
  refreshTokenExpires: process.env.REFRESH_TOKEN_EXPIRES || '7d',
};

module.exports = env;