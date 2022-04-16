import { Client } from 'edgedb';

export interface User {
  id: string;
  createdAt: string;
  updatedAt: string;
  lastConnection: string;
  email: string;
  password: string;
  username: string;
  tag: string;
  discriminator: string;
  placeholderColor: string;
  profilePic: string;
  expoToken: string;
  recentlySent: string[];
  isPro: boolean;
  role: string;
  remainingBytes: number;
  remainingTrasfers: number;
}

export interface File {
  id: string;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  name: string;
  size: number;
  url: string;
  hostFilename: string;
  fileType: string;
  senderDevice: string;
  remainingExpiryModifications: number;
  from: User;
  to: User[];
}

export interface ResolverContext {
  db: Client;
  userID: string;
}
