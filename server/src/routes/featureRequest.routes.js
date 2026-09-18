const { Router } = require('express');
const { body, query, param } = require('express-validator');
const feature = require('../controllers/featureRequest.controller');
const comment = require('../controllers/comment.controller');
const validateRequest = require('../middleware/validateRequest');
const verifyAccessToken = require('../middleware/verifyAccessToken');
const { upvoteLimiter } = require('../middleware/rateLimiter');

const router = Router();

const CATEGORIES = ['UI/UX', 'Integrations', 'Performance', 'General'];

router.get(
  '/',
  [
    query('sort').optional().isIn(['trending', 'newest', 'most-discussed']).withMessage('Unknown sort'),
    query('category').optional().isIn(CATEGORIES).withMessage('Unknown category'),
    query('status').optional().isString(),
    query('q').optional().isString(),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 }),
  ],
  validateRequest,
  feature.list
);

router.post(
  '/',
  verifyAccessToken,
  [
    body('title').trim().isLength({ min: 3, max: 120 }).withMessage('Title must be 3–120 characters'),
    body('description').trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
    body('category').isIn(CATEGORIES).withMessage('Pick a valid category'),
  ],
  validateRequest,
  feature.create
);

router.get(
  '/:id/comments',
  param('id').isMongoId().withMessage('Invalid request id'),
  validateRequest,
  comment.listByRequest
);

router.post(
  '/:id/comments',
  verifyAccessToken,
  [
    param('id').isMongoId().withMessage('Invalid request id'),
    body('content').trim().isLength({ min: 1, max: 2000 }).withMessage('Comment must be 1–2000 characters'),
    body('parentComment').optional().isMongoId().withMessage('Invalid parent comment id'),
  ],
  validateRequest,
  comment.create
);

router.post('/:id/upvote', verifyAccessToken, upvoteLimiter, feature.toggleUpvote);

router.get('/:id', param('id').isMongoId().withMessage('Invalid request id'), validateRequest, feature.getById);

router.patch(
  '/:id',
  verifyAccessToken,
  [
    param('id').isMongoId().withMessage('Invalid request id'),
    body('title').optional().trim().isLength({ min: 3, max: 120 }).withMessage('Title must be 3–120 characters'),
    body('description').optional().trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
    body('category').optional().isIn(CATEGORIES).withMessage('Pick a valid category'),
  ],
  validateRequest,
  feature.update
);

router.delete('/:id', verifyAccessToken, param('id').isMongoId().withMessage('Invalid request id'), validateRequest, feature.remove);

module.exports = router;