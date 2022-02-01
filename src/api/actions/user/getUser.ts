import { Client } from 'edgedb';

import TokenManager from '../../../lib/tokenManager';

import { User } from '../../../types';

const options = {};

const getUser = async ({ db, headers }) => {
  const client: Client = db;

  const encryptedToken = headers.authorization.substr(7);
  const { id } = await TokenManager.verifyEncryptedToken(encryptedToken);

  const user = await client.querySingle<User>(
    `select User { id, email, username, tag, discriminator, profilePic, placeholderColor, isPro, remainingBytes, remainingTransfers } filter .id = <uuid>$id`,
    { id }
  );

  return { user };
};

export default { options, handler: getUser };
