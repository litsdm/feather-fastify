import { Client } from 'edgedb';

const options = {};

const allUsers = async ({ db }) => {
  const client: Client = db;

  const users = await client.query('select User');

  return users;
};

export default { options, handler: allUsers };
