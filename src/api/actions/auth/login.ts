import { Client } from 'edgedb';

import {
  comparePasswords,
  generateEncryptedToken
} from '../../../lib/encryption';

import { User } from '../../../types';

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

const findUser = async (db: Client, email: string): Promise<User> => {
  const user = await db.querySingle<User>(
    `select User { id, email, password, username, role, isPro } filter .email = <str>$email`,
    { email }
  );

  if (!user) throw new Error('There is no user with that email.');

  return user;
};

const login = async ({ db, body }, reply) => {
  const { email, password } = body;

  try {
    const user = await findUser(db, email);
    await comparePasswords(password, user.password);
    const token = generateEncryptedToken(user);

    return { token };
  } catch (exception) {
    reply.code(401);
    throw new Error(exception.message);
  }
};

export default { options, handler: login };
