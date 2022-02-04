import { Client } from 'edgedb';

import TokenManager from '../../../lib/tokenManager';
import { comparePasswords } from '../../../lib/encryption';

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
          token: { type: 'string' },
          refreshToken: { type: 'string' }
        }
      }
    }
  }
};

const checkAndDeleteGuest = async (client: Client, authorization: string) => {
  const encryptedToken = authorization.slice(7);
  const { id, role } = await TokenManager.verifyEncryptedToken(encryptedToken);

  if (role !== 'guest') return;

  await client.querySingle(`delete User filter .id = <uuid>$id`, { id });
};

const findUser = async (db: Client, email: string): Promise<User> => {
  const user = await db.querySingle<User>(
    `select User { id, email, password, username, role, isPro } filter .email = <str>$email`,
    { email }
  );

  if (!user) throw new Error('There is no user with that email.');

  return user;
};

const login = async ({ db, body, headers }, reply) => {
  const { email, password } = body;

  try {
    if (headers.authorization) checkAndDeleteGuest(db, headers.authorization);

    const { password: userPassword, ...user } = await findUser(db, email);
    await comparePasswords(password, userPassword);
    const { accessToken, refreshToken } = TokenManager.generateTokens(user);

    return { token: accessToken, refreshToken };
  } catch (exception) {
    reply.code(401);
    throw new Error(exception.message);
  }
};

export default { options, handler: login };
