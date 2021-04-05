import mongoose, { Schema } from 'mongoose';

const { ObjectId } = Schema.Types;

const LinkSchema = new Schema({
  createdAt: { type: Date },
  expiresAt: { type: Date },
  updatedAt: { type: Date },
  type: { type: String, default: 'compress' },
  size: { type: Number, required: true },
  files: [{ type: ObjectId, ref: 'File' }],
  from: { type: ObjectId, ref: 'User' },
  to: [String],
  emails: [String],
  slug: { type: String, default: '' }
});

LinkSchema.pre('save', function preSave(next) {
  const now = new Date();
  this.updatedAt = now;
  if (!this.createdAt) {
    this.createdAt = now;
    this.expiresAt = now.setDate(now.getDate() + 1);
  }
  next();
});

export default mongoose.model('Link', LinkSchema);
