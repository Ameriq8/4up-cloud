import { Role, SessionType } from '@root/constants';
import { CDNRequest } from '@root/types';
import { Response, NextFunction } from 'express';
import * as database from '@utils/database';
import { validateToken } from '@root/utils/jwt';
import { decrypt } from '@root/utils/helper';

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
  req: CDNRequest,
  res: Response,
  next: NextFunction,
): Promise<void | Response> => {
  let token = req.headers.authorization;
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  token = token.replace('Bearer ', '');

  // const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  // const userIp = await checkUserIp(ip.toString());
  // if (typeof userIp == 'boolean') return res.status(400).json({ message: 'Error when trying to get user ip' });

  const session = await database.sessions.get({ token });
  if (!session) return res.status(400).json({ message: 'Invalid token' });
  // if (session.ip !== userIp) return res.status(401).json({ message: 'New login location' });
  if (session.type != SessionType.AUTH) return res.status(400).json({ message: 'Invalid token type' });

  token = await decrypt({ iv: session.iv, data: session.data }, 'JWT_TOKEN');

  let parts = token.split('.');
  if (parts.length !== 3) return res.status(400).json({ message: 'Invalid token' });

  const decodedToken = await validateToken('AUTH', token);
  if (!decodedToken) return res.status(401).json({ message: 'Invalid token' });

  let foundUser = await database.users.getById(decodedToken.id);
  if (!foundUser) return res.status(401).json({ message: 'Invalid user' });

  req.user = foundUser;
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
  next();
};
