import { AES, enc } from 'crypto-js';
import bcrypt from 'bcrypt';
import pify from 'pify';

const { TOKEN_ENCRYPTION_SECRET } = process.env;

export const encryptToken = (token: string) =>
  AES.encrypt(token, TOKEN_ENCRYPTION_SECRET).toString();

export const decryptToken = (encryptedToken: string) =>
  AES.decrypt(encryptedToken, TOKEN_ENCRYPTION_SECRET).toString(enc.Utf8);

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
