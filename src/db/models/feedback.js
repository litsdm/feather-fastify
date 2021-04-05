import mongoose, { Schema } from 'mongoose';

const { ObjectId } = Schema.Types;

const FeedbackSchema = new Schema({
  createdOn: { type: Date, default: Date.now },
  sender: { type: ObjectId, ref: 'User' },
  type: String,
  message: String
});

export default mongoose.model('Feedback', FeedbackSchema);
