import mongoose, { Schema } from 'mongoose';

const { ObjectId } = Schema.Types;

const FriendRequestSchema = new Schema({
  createdAt: { type: Date },
  updatedAt: { type: Date },
  from: { type: ObjectId, ref: 'User' },
  to: { type: ObjectId, ref: 'User' }
});

FriendRequestSchema.pre('save', function preSave(next) {
  const now = new Date();
  this.updatedAt = now;
  if (!this.createdAt) this.createdAt = now;

  next();
});

export default mongoose.model('FriendRequest', FriendRequestSchema);
