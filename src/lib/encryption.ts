import { AES, enc } from 'crypto-js';
import bcrypt from 'bcrypt';
import pify from 'pify';
import jwt from 'jsonwebtoken';

import { User } from '../types';

const { TOKEN_ENCRYPTION_SECRET, JWT_SECRET } = process.env;

export const encryptToken = (token: string) =>
  AES.encrypt(token, TOKEN_ENCRYPTION_SECRET).toString();

export const decryptToken = (encryptedToken: string) =>
  AES.decrypt(encryptedToken, TOKEN_ENCRYPTION_SECRET).toString(enc.Utf8);

export const generateEncryptedToken = (user: User) => {
  const { id, username, email, role, isPro } = user;
  const token = jwt.sign({ id, username, email, role, isPro }, JWT_SECRET, {
    expiresIn: '1h'
  });

  return encryptToken(token);
};

export const hashPassword = async (password: string) => {
  const pBcrypt = pify(bcrypt);
  const salt = await pBcrypt.genSalt(10);
  const hash = await pBcrypt.hash(password, salt);

  return hash;
};

export const comparePasswords = async (password: string, hash: string) => {
  const isMatch = await pify(bcrypt).compare(password, hash);
  if (!isMatch) throw new Error('Password does not match.');
};
