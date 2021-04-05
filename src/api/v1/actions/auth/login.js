import jwt from 'jsonwebtoken';

import User from '../../../../db/models/user';

export const generateToken = user => {
  const {
    _id,
    username,
    email,
    placeholderColor,
    discriminator,
    profilePic,
    isPro,
    remainingBytes,
    remainingFiles,
    remainingTransfers,
    role
  } = user;
  return jwt.sign(
    {
      _id,
      username,
      email,
      placeholderColor,
      discriminator,
      profilePic,
      isPro,
      remainingBytes,
      remainingFiles,
      remainingTransfers,
      role
    },
    process.env.JWT_SECRET
  );
};

const comparePassword = (user, password) =>
  new Promise((resolve, reject) => {
    user.comparePassword(password, (err, isMatch) => {
      if (!isMatch) reject(new Error('Password is incorrect.'));
      resolve();
    });
  });

const findUser = email =>
  new Promise((resolve, reject) => {
    User.findOne({ email }, (error, user) => {
      if (error) reject(error);
      if (!user) reject(new Error('There is no user with that email.'));
      resolve(user);
    });
  });

const options = {
  schema: {
    body: {
      type: 'object',
      properties: {
        email: { type: 'string' },
        password: { type: 'string' },
        username: { type: 'string' }
      }
    },
    response: {
      200: {
        type: 'object',
        properties: {
          token: { type: 'string' }
        }
      }
    }
  }
};

const login = async ({ body }) => {
  const { email, password } = body;

  const user = await findUser(email);
  await comparePassword(user, password);
  const token = generateToken(user);

  return { token };
};

export default { options, handler: login };
