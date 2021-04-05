import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

const { ObjectId } = Schema.Types;

// eslint-disable-next-line prettier/prettier
const COLORS = ['#F44336', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5', '#2196F3', '#03A9F4', '#00BCD4', '#009688', '#4CAF50', '#8BC34A', '#FFC107', '#FF9800', '#FF5722', '#607D8B'];

const UserSchema = new Schema({
  createdAt: { type: Date },
  updatedAt: { type: Date },
  lastConnection: { type: Date },
  email: { type: String, unique: true, required: true, text: true },
  password: { type: String, required: true },
  username: { type: String, required: true, text: true },
  placeholderColor: {
    type: String,
    default: COLORS[Math.floor(Math.random() * COLORS.length)]
  },
  friends: [{ type: ObjectId, ref: 'User' }],
  profilePic: { type: String, default: '' },
  tag: { type: String },
  discriminator: { type: String },
  expoToken: { type: String },
  isPro: { type: Boolean, default: false },
  remainingBytes: { type: Number, default: 2147483648 },
  remainingFiles: { type: Number, default: 3 },
  remainingTransfers: { type: Number, default: 3 },
  role: { type: String, default: 'user' },
  recentlySent: [String]
});

const encryptPassword = password =>
  new Promise((resolve, reject) => {
    bcrypt.genSalt(10, (err, salt) => {
      if (err) reject(err);
      bcrypt.hash(password, salt, (error, hash) => {
        if (error) reject(error);
        resolve(hash);
      });
    });
  });

UserSchema.pre('save', async function preSave(next) {
  const now = new Date();
  this.updatedAt = now;
  if (!this.lastConnection) this.lastConnection = now;
  if (!this.createdAt) this.createdAt = now;
  if (!this.tag) {
    const discriminator = Math.random().toString().substr(2, 4);
    this.tag = `${this.username}#${discriminator}`;
    this.discriminator = discriminator;
  }

  // ENCRYPT PASSWORD
  const user = this;
  if (!user.isModified('password')) return next();

  const encryptedPassword = await encryptPassword(user.password);
  user.password = encryptedPassword;
  next();
});

UserSchema.methods.comparePassword = function compare(password, done) {
  bcrypt.compare(password, this.password, (err, isMatch) => {
    done(err, isMatch);
  });
};

export default mongoose.model('User', UserSchema);
