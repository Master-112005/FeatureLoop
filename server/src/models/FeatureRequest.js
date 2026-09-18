const mongoose = require('mongoose');

const featureRequestSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: ['UI/UX', 'Integrations', 'Performance', 'General'],
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['Under Review', 'Planned', 'In Progress', 'Completed'],
      default: 'Under Review',
    },
    upvotedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    upvoteCount: { type: Number, default: 0 },
    commentCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

featureRequestSchema.index({ title: 'text', description: 'text' });
featureRequestSchema.index({ status: 1, category: 1 });

featureRequestSchema.methods.toPublic = function toPublic() {
  return {
    id: String(this._id),
    title: this.title,
    description: this.description,
    category: this.category,
    status: this.status,
    upvoteCount: this.upvoteCount,
    commentCount: this.commentCount,
    upvotedBy: this.upvotedBy.map((id) => String(id)),
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

module.exports = mongoose.model('FeatureRequest', featureRequestSchema);