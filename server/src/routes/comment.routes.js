const { Router } = require('express');
const { body, param } = require('express-validator');
const comment = require('../controllers/comment.controller');
const validateRequest = require('../middleware/validateRequest');
const verifyAccessToken = require('../middleware/verifyAccessToken');

const router = Router();

router.patch(
  '/:id',
  verifyAccessToken,
  [
    param('id').isMongoId().withMessage('Invalid comment id'),
    body('content').trim().isLength({ min: 1, max: 2000 }).withMessage('Comment must be 1–2000 characters'),
  ],
  validateRequest,
  comment.update
);

router.delete(
  '/:id',
  verifyAccessToken,
  param('id').isMongoId().withMessage('Invalid comment id'),
  validateRequest,
  comment.remove
);

module.exports = router;