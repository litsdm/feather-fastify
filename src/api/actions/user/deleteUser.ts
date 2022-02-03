import { Client } from 'edgedb';

import TokenManager from '../../../lib/tokenManager';

import { User } from '../../../types';

const options = {};

const deleteUser = async ({ db, headers }) => {
  const client: Client = db;

  const encryptedToken = headers.authorization.substr(7);
  const { id } = await TokenManager.verifyEncryptedToken(encryptedToken);

  const user = await client.querySingle<User>(
    `delete User filter .id = <uuid>$id`,
    { id }
  );

  return user;
};

export default { options, handler: deleteUser };
