const mongoose = require('mongoose');
const FeatureRequest = require('../models/FeatureRequest');
const { sanitizeMarkdown, sanitizeTitle } = require('../utils/sanitize');

const FEED_SORTS = {
  trending: { upvoteCount: -1, createdAt: -1 },
  newest: { createdAt: -1 },
  'most-discussed': { commentCount: -1, createdAt: -1 },
};

const AUTHOR_POPULATE = 'username email avatarUrl role isVerified createdAt';

function isValidId(id) {
  return mongoose.isValidObjectId(id);
}

exports.list = async (req, res, next) => {
  try {
    const { sort = 'trending', category, status, q } = req.query;
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 12));

    const filter = {};
    if (category) filter.category = category;
    if (status) filter.status = status;
    if (q && String(q).trim()) filter.$text = { $search: sanitizeMarkdown(q) };

    const sortBy = FEED_SORTS[sort] || FEED_SORTS.trending;

    const total = await FeatureRequest.countDocuments(filter);
    const items = await FeatureRequest.find(filter)
      .sort(sortBy)
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

exports.getById = async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid request id', code: 'INVALID_ID' });
    }
    const request = await FeatureRequest.findById(req.params.id).populate('author', AUTHOR_POPULATE);
    if (!request) {
      return res.status(404).json({ error: 'Feature request not found', code: 'NOT_FOUND' });
    }
    return res.json({ item: { ...request.toPublic(), author: request.author } });
  } catch (err) {
    return next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { title, description, category } = req.body;
    const item = await FeatureRequest.create({
      title: sanitizeTitle(title),
      description: sanitizeMarkdown(description),
      category,
      author: req.user.userId,
    });
    const populated = await item.populate('author', AUTHOR_POPULATE);
    return res.status(201).json({ item: { ...populated.toPublic(), author: populated.author } });
  } catch (err) {
    return next(err);
  }
};

async function canModify(req) {
  const item = await FeatureRequest.findById(req.params.id);
  if (!item) return { item: null };
  const isAuthor = String(item.author) === String(req.user.userId);
  const isAdmin = req.user.role === 'admin';
  if (!isAuthor && !isAdmin) return { item, allowed: false };
  return { item, allowed: true };
}

exports.update = async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid request id', code: 'INVALID_ID' });
    }
    const { item, allowed } = await canModify(req);
    if (!item) return res.status(404).json({ error: 'Feature request not found', code: 'NOT_FOUND' });
    if (!allowed) {
      return res.status(403).json({ error: 'Only the author or an admin can edit this', code: 'FORBIDDEN' });
    }

    const updates = {};
    if (req.body.title !== undefined) updates.title = sanitizeTitle(req.body.title);
    if (req.body.description !== undefined) updates.description = sanitizeMarkdown(req.body.description);
    if (req.body.category !== undefined) updates.category = req.body.category;

    Object.assign(item, updates);
    await item.save();
    await item.populate('author', AUTHOR_POPULATE);
    return res.json({ item: { ...item.toPublic(), author: item.author } });
  } catch (err) {
    return next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid request id', code: 'INVALID_ID' });
    }
    const { item, allowed } = await canModify(req);
    if (!item) return res.status(404).json({ error: 'Feature request not found', code: 'NOT_FOUND' });
    if (!allowed) {
      return res.status(403).json({ error: 'Only the author or an admin can delete this', code: 'FORBIDDEN' });
    }
    await FeatureRequest.deleteOne({ _id: item._id });
    return res.json({ message: 'Feature request deleted' });
  } catch (err) {
    return next(err);
  }
};

/**
 * Atomic upvote toggle — a single round-trip, no read-then-write race.
 * $addToSet prevents duplicate votes, $inc keeps the counter desync-proof
 * even under concurrent requests from different users.
 */
exports.toggleUpvote = async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid request id', code: 'INVALID_ID' });
    }
    const requestId = req.params.id;
    const userId = req.user.userId;

    const exists = await FeatureRequest.exists({ _id: requestId });
    if (!exists) {
      return res.status(404).json({ error: 'Feature request not found', code: 'NOT_FOUND' });
    }

    const alreadyVoted = await FeatureRequest.exists({ _id: requestId, upvotedBy: userId });

    const update = alreadyVoted
      ? { $pull: { upvotedBy: userId }, $inc: { upvoteCount: -1 } }
      : { $addToSet: { upvotedBy: userId }, $inc: { upvoteCount: 1 } };

    const updated = await FeatureRequest.findByIdAndUpdate(requestId, update, { new: true });

    return res.json({
      upvoted: !alreadyVoted,
      item: updated.toPublic(),
    });
  } catch (err) {
    return next(err);
  }
};