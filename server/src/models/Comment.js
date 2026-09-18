const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    content: { type: String, required: true },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    featureRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FeatureRequest',
      required: true,
      index: true,
    },
    parentComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment',
      default: null,
    },
    isEdited: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

commentSchema.methods.toPublic = function toPublic() {
  return {
    id: String(this._id),
    content: this.content,
    author: this.author,
    featureRequest: String(this.featureRequest),
    parentComment: this.parentComment ? String(this.parentComment) : null,
    isEdited: this.isEdited,
    isDeleted: this.isDeleted,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

module.exports = mongoose.model('Comment', commentSchema);