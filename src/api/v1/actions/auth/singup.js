import User from '../../../../db/models/user';

import { generateToken } from './login';

const saveUser = userData =>
  new Promise((resolve, reject) => {
    const user = new User(userData);
    user.save(error => {
      if (error) reject(error);
      resolve(user);
    });
  });

const checkForExistingUser = email =>
  new Promise((resolve, reject) => {
    User.findOne({ email }, (error, user) => {
      if (error) reject(error);
      if (user) reject(new Error('Email already in use.'));
      resolve(user);
    });
  });

const options = {
  schema: {
    body: {
      type: 'object',
      properties: {
        email: { type: 'string' },
        password: { type: 'string' }
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

const signup = async ({ body }) => {
  const { email } = body;

  await checkForExistingUser(email);
  const user = await saveUser(body);
  const token = generateToken(user);

  return { token };
};

export default { options, handler: signup };
