const { Router } = require('express');
const { body, param } = require('express-validator');
const auth = require('../controllers/auth.controller');
const validateRequest = require('../middleware/validateRequest');
const verifyAccessToken = require('../middleware/verifyAccessToken');

const router = Router();

router.post(
  '/signup',
  [
    body('username')
      .trim()
      .isLength({ min: 3, max: 30 })
      .withMessage('Username must be 3–30 characters')
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('Username may only contain letters, numbers and underscores'),
    body('email').isEmail().withMessage('A valid email is required').normalizeEmail(),
    body('password')
      .isLength({ min: 8, max: 72 })
      .withMessage('Password must be 8–72 characters'),
    body('adminPassword')
      .isString()
      .notEmpty()
      .withMessage('Admin authorization password is required'),
  ],
  validateRequest,
  auth.signup
);

router.get('/verify/:token', param('token').isString().notEmpty(), validateRequest, auth.verifyEmail);

router.post(
  '/login',
  [
    body('emailOrUsername').trim().notEmpty().withMessage('Email or username is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validateRequest,
  auth.login
);

router.post('/refresh', auth.refresh);
router.post('/logout', auth.logout);

router.post(
  '/forgot-password',
  [body('email').isEmail().withMessage('A valid email is required').normalizeEmail()],
  validateRequest,
  auth.forgotPassword
);

router.post(
  '/reset-password/:token',
  [
    param('token').isString().notEmpty(),
    body('password').isLength({ min: 8, max: 72 }).withMessage('Password must be 8–72 characters'),
  ],
  validateRequest,
  auth.resetPassword
);

router.get('/me', verifyAccessToken, auth.me);

module.exports = router;