import { Client } from 'edgedb';

import { hashPassword, generateEncryptedToken } from '../../../lib/encryption';

import { User } from '../../../types';

type Body = {
  password: string,
  email: string
};

const PH_COLORS = [
  '#F44336',
  '#E91E63',
  '#9C27B0',
  '#673AB7',
  '#3F51B5',
  '#2196F3',
  '#03A9F4',
  '#00BCD4',
  '#009688',
  '#4CAF50',
  '#8BC34A',
  '#FFC107',
  '#FF9800',
  '#FF5722',
  '#607D8B'
];

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

const checkExistingUser = async (db: Client, email: string) => {
  const user = await db.querySingle(
    `select User { id, email } filter .email = <str>$email`,
    { email }
  );

  if (user) throw new Error(`User with email ${email} already exists.`);
};

const createUser = async (
  db: Client,
  { email, password }: Body
): Promise<User> => {
  const now = new Date();

  const hashedPassword = await hashPassword(password);
  const username = email.split('@')[0];
  const discriminator = Math.random().toString().slice(2, 6);
  const tag = `${username}#${discriminator}`;

  const userData = {
    createdAt: now.toString(),
    updatedAt: now.toString(),
    lastConnection: now.toString(),
    email,
    password: hashedPassword,
    placeholderColor: PH_COLORS[Math.floor(Math.random() * PH_COLORS.length)],
    isPro: false,
    username,
    discriminator,
    tag
  };

  await db.query<User>(
    `insert User {
      createdAt := <str>$createdAt,
      updatedAt := <str>$updatedAt,
      lastConnection := <str>$lastConnection,
      email := <str>$email,
      password := <str>$password,
      placeholderColor := <str>$placeholderColor,
      isPro := <bool>$isPro,
      username := <str>$username,
      discriminator := <str>$discriminator,
      tag := <str>$tag,
    }`,
    userData
  );

  const user = await db.querySingle<User>(
    `select User { id, email, username, role, isPro } filter .email = <str>$email`,
    { email }
  );

  return user;
};

const signup = async ({ db, body }, reply) => {
  const { email } = body;

  try {
    await checkExistingUser(db, email);
    const user = await createUser(db, body);
    const token = generateEncryptedToken(user);

    return { token };
  } catch (exception) {
    console.log(exception.message);
    reply.code(401);
    throw new Error(exception.message);
  }
};

export default { options, handler: signup };
