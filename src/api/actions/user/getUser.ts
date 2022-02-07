import { Client } from 'edgedb';

import TokenManager from '../../../lib/tokenManager';

import { User } from '../../../types';

const options = {};

const getUser = async ({ db, headers }) => {
  try {
    const client: Client = db;

    const encryptedToken = headers.authorization.substr(7);
    const { id } = await TokenManager.verifyEncryptedToken(encryptedToken);

    const user = await client.querySingle<User>(
      `select User { id, email, username, tag, discriminator, profilePic, placeholderColor, isPro, remainingTransfers, role } filter .id = <uuid>$id`,
      { id }
    );

    return { user };
  } catch (exception) {
    console.log(exception.message);
    throw exception;
  }
};

export default { options, handler: getUser };
