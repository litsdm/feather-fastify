import { Client } from 'edgedb';

import TokenManager from '../../../lib/tokenManager';

import { PH_COLORS } from '../../../constants';

import { User } from '../../../types';

const options = {
  schema: {
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

const insertGuest = (client: Client) => {
  const now = new Date();

  const guestData = {
    createdAt: now.toString(),
    updatedAt: now.toString(),
    lastConnection: now.toString(),
    username: `Guest${Math.random().toString().slice(2, 6)}`,
    placeholderColor: PH_COLORS[Math.floor(Math.random() * PH_COLORS.length)],
    role: 'guest'
  };

  const guest = client.querySingle<User>(
    `with guest := (insert User {
      createdAt := <str>$createdAt,
      updatedAt := <str>$updatedAt,
      lastConnection := <str>$lastConnection,
      placeholderColor := <str>$placeholderColor,
      username := <str>$username,
      role := <str>$role
    })
    select guest { id, email, username, role, isPro }`,
    guestData
  );

  if (!guest) throw new Error('Error creating guest.');

  return { ...guest };
};

const createGuest = async ({ db }, reply) => {
  try {
    const guest = await insertGuest(db);
    const { accessToken, refreshToken } = TokenManager.generateTokens(guest);

    return { token: accessToken, refreshToken };
  } catch (exception) {
    console.log(exception.message);
    reply.code(401);
    throw new Error(exception.message);
  }
};

export default { options, handler: createGuest };
