const mongoose = require('mongoose');
const Comment = require('../models/Comment');
const FeatureRequest = require('../models/FeatureRequest');
const { sanitizeMarkdown } = require('../utils/sanitize');

const AUTHOR_POPULATE = 'username email avatarUrl role isVerified createdAt';

function isValidId(id) {
  return mongoose.isValidObjectId(id);
}

exports.listByRequest = async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid request id', code: 'INVALID_ID' });
    }
    const exists = await FeatureRequest.exists({ _id: req.params.id });
    if (!exists) {
      return res.status(404).json({ error: 'Feature request not found', code: 'NOT_FOUND' });
    }

    const comments = await Comment.find({ featureRequest: req.params.id })
      .sort({ createdAt: 1 })
      .populate('author', AUTHOR_POPULATE);

    return res.json({
      items: comments.map((c) => ({ ...c.toPublic(), author: c.author })),
    });
  } catch (err) {
    return next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid request id', code: 'INVALID_ID' });
    }
    const featureRequest = await FeatureRequest.findById(req.params.id);
    if (!featureRequest) {
      return res.status(404).json({ error: 'Feature request not found', code: 'NOT_FOUND' });
    }

    const { content, parentComment } = req.body;

    // Replies must belong to the same request & actually exist
    if (parentComment) {
      if (!isValidId(parentComment)) {
        return res.status(422).json({ error: 'Invalid parent comment id', code: 'VALIDATION_ERROR' });
      }
      const parent = await Comment.findOne({ _id: parentComment, featureRequest: featureRequest._id });
      if (!parent) {
        return res.status(422).json({ error: 'Parent comment not found on this request', code: 'VALIDATION_ERROR' });
      }
    }

    const comment = await Comment.create({
      content: sanitizeMarkdown(content),
      author: req.user.userId,
      featureRequest: featureRequest._id,
      parentComment: parentComment || null,
    });
    await featureRequest.updateOne({ $inc: { commentCount: 1 } });

    await comment.populate('author', AUTHOR_POPULATE);
    return res.status(201).json({ item: { ...comment.toPublic(), author: comment.author } });
  } catch (err) {
    return next(err);
  }
};

async function loadModifiable(req) {
  const comment = await Comment.findById(req.params.id);
  if (!comment) return { comment: null };
  const isAuthor = String(comment.author) === String(req.user.userId);
  const isAdmin = req.user.role === 'admin';
  return { comment, allowed: isAuthor || isAdmin };
}

exports.update = async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid comment id', code: 'INVALID_ID' });
    }
    const { comment, allowed } = await loadModifiable(req);
    if (!comment) return res.status(404).json({ error: 'Comment not found', code: 'NOT_FOUND' });
    if (!allowed) {
      return res.status(403).json({ error: 'Only the author or an admin can edit this comment', code: 'FORBIDDEN' });
    }

    const content = sanitizeMarkdown(req.body.content);
    if (!content) {
      return res.status(422).json({ error: 'Comment content cannot be empty', code: 'VALIDATION_ERROR' });
    }

    const changed = content !== comment.content;
    comment.content = content;
    comment.isEdited = changed ? true : comment.isEdited;
    await comment.save();
    await comment.populate('author', AUTHOR_POPULATE);

    return res.json({ item: { ...comment.toPublic(), author: comment.author } });
  } catch (err) {
    return next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid comment id', code: 'INVALID_ID' });
    }
    const { comment, allowed } = await loadModifiable(req);
    if (!comment) return res.status(404).json({ error: 'Comment not found', code: 'NOT_FOUND' });
    if (!allowed) {
      return res.status(403).json({ error: 'Only the author or an admin can delete this comment', code: 'FORBIDDEN' });
    }
    if (comment.isDeleted) {
      return res.json({ item: { ...comment.toPublic(), author: comment.author } });
    }

    // Soft delete — preserves reply thread shape. Children keep rendering;
    // this node renders as a "[comment deleted]" placeholder.
    // use updateOne so the emptied `content` (required in schema) does not
    // trip Mongoose validators.
    await Comment.updateOne(
      { _id: comment._id },
      { $set: { isDeleted: true, content: '' } }
    );
    comment.isDeleted = true;
    comment.content = '';

    const visibleCount = await Comment.countDocuments({
      featureRequest: comment.featureRequest,
      isDeleted: false,
    });
    await FeatureRequest.updateOne(
      { _id: comment.featureRequest },
      { $set: { commentCount: visibleCount } }
    );

    await comment.populate('author', AUTHOR_POPULATE);
    return res.json({ item: { ...comment.toPublic(), author: comment.author } });
  } catch (err) {
    return next(err);
  }
};