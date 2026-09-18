const { Router } = require('express');
const { body, param, query } = require('express-validator');
const admin = require('../controllers/admin.controller');
const validateRequest = require('../middleware/validateRequest');
const verifyAccessToken = require('../middleware/verifyAccessToken');
const requireRole = require('../middleware/requireRole');

const router = Router();

router.get(
  '/roadmap',
  [query('page').optional().isInt({ min: 1 }), query('limit').optional().isInt({ min: 1, max: 50 })],
  validateRequest,
  admin.roadmap
);

router.get('/admin/requests', verifyAccessToken, requireRole('admin'), admin.adminList);

router.patch(
  '/admin/requests/:id/status',
  verifyAccessToken,
  requireRole('admin'),
  [
    param('id').isMongoId().withMessage('Invalid request id'),
    body('status').isIn(['Under Review', 'Planned', 'In Progress', 'Completed']).withMessage('Unknown status'),
    body('force').optional().isBoolean().withMessage('force must be a boolean'),
  ],
  validateRequest,
  admin.updateStatus
);

module.exports = router;