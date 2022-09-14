import { Role } from '@root/constants';
import { CDNRequest } from '@root/types';
import { Request, Response, NextFunction } from 'express';
import * as database from '@utils/database';
import { validateToken } from '@root/utils/jwt';

export const isAdmin = async (
  req: CDNRequest,
  res: Response,
  next: NextFunction,
): Promise<void | Response> => {
  if (!req.user || req.user.role != Role.STAFF)
    return res.status(403).json({
      message: 'Missing Access',
    });
  next();
};

export const isAuth = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void | Response> => {
  let token = req.headers.authorization;
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  token = token.replace('Bearer ', '');
  const decodedToken = await validateToken('auth', token);
  if (decodedToken === 'jwt malformed') return res.status(400).json({ message: 'Invalid Token' });
  if (!decodedToken) return res.status(401).json({ message: 'Invalid Token' });
  let foundUser = await database.users.getById(decodedToken.id);
  if (!foundUser) return res.status(401).json({ message: 'Invalid User' });
  req.user = foundUser;

  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
  next();
};
