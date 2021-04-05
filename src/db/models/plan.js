import mongoose, { Schema } from 'mongoose';

const PlanSchema = new Schema({
  createdAt: { type: Date },
  updatedAt: { type: Date },
  stripeId: String,
  amount: Number
});

PlanSchema.pre('save', function preSave(next) {
  const now = new Date();
  this.updatedAt = now;
  if (!this.createdAt) this.createdAt = now;

  next();
});

export default mongoose.model('Plan', PlanSchema);
