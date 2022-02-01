import jwt from 'jsonwebtoken';
import pify from 'pify';

import { decryptToken, encryptToken } from './encryption';

const { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } = process.env;

export default class TokenManager {
  static generateAccessToken(data: any) {
    const token = jwt.sign(data, ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
    return encryptToken(token);
  }

  static generateRefreshToken(data: any) {
    const token = jwt.sign(data, REFRESH_TOKEN_SECRET, { expiresIn: '60d' });
    return encryptToken(token);
  }

  static generateTokens(data: any) {
    const accessToken = this.generateAccessToken(data);
    const refreshToken = this.generateRefreshToken(data);

    return { accessToken, refreshToken };
  }

  static async verifyEncryptedToken(encryptedToken: string, isRefresh = false) {
    const secret = isRefresh ? REFRESH_TOKEN_SECRET : ACCESS_TOKEN_SECRET;
    const token = decryptToken(encryptedToken);
    return pify(jwt).verify(token, secret);
  }

  static async verifyToken(token: string, isRefresh = false) {
    const secret = isRefresh ? REFRESH_TOKEN_SECRET : ACCESS_TOKEN_SECRET;
    return pify(jwt).verify(token, secret);
  }
}
