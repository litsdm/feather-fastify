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
