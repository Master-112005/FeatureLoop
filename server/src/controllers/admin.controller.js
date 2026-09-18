const mongoose = require('mongoose');
const FeatureRequest = require('../models/FeatureRequest');

const AUTHOR_POPULATE = 'username email avatarUrl role isVerified createdAt';

const STATUS_FLOW = ['Under Review', 'Planned', 'In Progress', 'Completed'];

function isValidId(id) {
  return mongoose.isValidObjectId(id);
}

exports.roadmap = async (req, res, next) => {
  try {
    const columnStatuses = ['Planned', 'In Progress', 'Completed'];
    const docs = await FeatureRequest.find({ status: { $in: columnStatuses } })
      .sort({ upvoteCount: -1, createdAt: -1 })
      .populate('author', AUTHOR_POPULATE);

    const columns = columnStatuses.map((status) => ({
      status,
      items: docs
        .filter((d) => d.status === status)
        .map((d) => ({ ...d.toPublic(), author: d.author })),
    }));

    return res.json({ columns });
  } catch (err) {
    return next(err);
  }
};

exports.adminList = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 25));
    const { status, category, q } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (q && String(q).trim()) filter.$text = { $search: String(q).trim() };

    const total = await FeatureRequest.countDocuments(filter);
    const items = await FeatureRequest.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('author', AUTHOR_POPULATE);

    return res.json({
      items: items.map((it) => ({ ...it.toPublic(), author: it.author })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    return next(err);
  }
};

/**
 * Enforces the allowed transition sequence:
 *   Under Review → Planned → In Progress → Completed
 * A request may only move forward exactly one step at a time.
 * Setting `force: true` bypasses the restriction for admins.
 */
exports.updateStatus = async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid request id', code: 'INVALID_ID' });
    }
    const item = await FeatureRequest.findById(req.params.id).populate('author', AUTHOR_POPULATE);
    if (!item) {
      return res.status(404).json({ error: 'Feature request not found', code: 'NOT_FOUND' });
    }

    const target = req.body.status;
    if (!STATUS_FLOW.includes(target)) {
      return res.status(422).json({
        error: `status must be one of: ${STATUS_FLOW.join(', ')}`,
        code: 'VALIDATION_ERROR',
      });
    }

    const force = req.body.force === true;
    const fromIdx = STATUS_FLOW.indexOf(item.status);
    const toIdx = STATUS_FLOW.indexOf(target);

    const isValidStep = toIdx === fromIdx + 1;
    const isForward = toIdx > fromIdx;

    if (item.status !== target && !((isValidStep) || (force && isForward))) {
      return res.status(409).json({
        error: `Cannot move "${item.status}" → "${target}". Allowed: exactly one step forward (use force for an override).`,
        code: 'INVALID_TRANSITION',
        from: item.status,
        to: target,
        allowedNext: STATUS_FLOW[fromIdx + 1] || null,
      });
    }

    const originalStatus = item.status;
    item.status = target;
    await item.save();

    return res.json({
      item: { ...item.toPublic(), author: item.author },
      transition: {
        from: originalStatus,
        to: target,
        forced: !!force && originalStatus !== target,
      },
    });
  } catch (err) {
    return next(err);
  }
};