import { Request } from 'express';
import {} from 'express-fileupload';
import { Role } from './constants';

export interface User {
  id: number;
  username: string;
  email: string;
  password?: string;
  verified: boolean;
  role: Role;
  files?: File[];
  avatar: string;
  bio?: string;
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
  published: boolean;
  timestamp: Date;
}

export interface UserToken {
  id: string;
  iat: number;
  exp: number;
  message?: string;
}

export interface FilesBodyType {
  name: string;
  data: Buffer;
  size: number;
  encoding: string;
  tempFilePath: string;
  truncated: boolean;
  mimetype: string;
  md5: string;
  mv: Function;
}

export interface CDNRequest extends Request {
  body?: any;
  params?: any;
  user: User;
  files?: FilesBodyType[] | FilesBodyType;
}
