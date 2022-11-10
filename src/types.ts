import { Request } from 'express';
import { Role, SessionType } from './constants';

export interface User {
  id: number;
  username: string;
  email: string;
  password?: string;
  verified: boolean;
  role: Role;
  files?: File[];
  plan: number;
  avatar: string;
  bio?: string;
  requests: number;
  storage: number;
  deleted: boolean;
  timestamp: Date;
}

export interface File {
  id: number;
  key: string;
  name: String;
  format: String;
  size: String;
  userId: number;
  downloads: number;
  deleted: boolean;
  published: boolean;
  timestamp: Date;
}

export interface CDNRequest extends Request {
  body: any;
  params: any;
  user: User;
  files?: any;
}

export interface UserToken {
  id: number;
  iat: number;
  exp: number;
  message?: string;
}

export interface HashedObject {
  iv: string;
  data: string;
}

export interface Session {
  id: number;
  userId: number;
  token: string;
  data: string;
  iv: string;
  type: SessionType;
  expire: Date;
  timestamp: Date;
}

export interface BusinessPlan {
  id: number;
  userId: number;
  storage: number;
  limitedPartSize: number;
  gateawayRequets: number;
  gateawayLimitPartSize: number;
  manageAccessPremissionForUsers: boolean;
}
