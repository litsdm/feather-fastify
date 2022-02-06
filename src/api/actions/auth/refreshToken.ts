import { Client } from 'edgedb';

import TokenManager from '../../../lib/tokenManager';
import { PH_COLORS } from '../../../constants';

import { User } from '../../../types';

const options = {
  schema: {
    200: {
      type: 'object',
      properties: {
        token: { type: 'string' },
        refreshToken: { type: 'string' }
      }
    }
  }
};

const deleteIfGuest = async (client: Client, userID: string) => {
  const user = await client.querySingle<User>(
    'select User { id, role } filter .id = <uuid>$userID',
    { userID }
  );

  if (user.role !== 'guest') return;

  await client.querySingle('delete User fitler .id = <uuid>$userID', {
    userID
  });
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

const validateToken = async (token: string): Promise<boolean> => {
  try {
    await TokenManager.verifyEncryptedToken(token);
  } catch (exception) {
    return false;
  }

  return true;
};

const validateRefreshToken = async (
  refreshToken: string
): Promise<Partial<User> | null> => {
  try {
    const { exp, iat, ...payload } = await TokenManager.verifyEncryptedToken(
      refreshToken,
      true
    );

    return payload;
  } catch (exception) {
    return null;
  }
};

const refreshTokenIfNeeded = async ({ db, headers, query }, reply) => {
  try {
    const accessToken = headers.authorization.substr(7);
    const refreshToken = headers['x-refresh-token'];

    const isAccessValid = await validateToken(accessToken);
    if (isAccessValid) return { token: accessToken, refreshToken };

    const refreshPayload = await validateRefreshToken(refreshToken);

    if (refreshPayload) {
      const token = TokenManager.generateAccessToken(refreshPayload);
      return { token, refreshToken };
    }

    if (query.userID) deleteIfGuest(db, query.userID);

    const guest = await insertGuest(db);
    const { accessToken: guestAccess, refreshToken: guestRefresh } =
      TokenManager.generateTokens(guest);

    return { token: guestAccess, refreshToken: guestRefresh };
  } catch (exception) {
    console.log(exception.message);
    reply.code(401).send(exception);
  }
};

export default { options, handler: refreshTokenIfNeeded };
