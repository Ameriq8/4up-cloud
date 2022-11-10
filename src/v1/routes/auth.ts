import { Router, Request, Response } from 'express';
import {
  forgetPasswordValidator,
  loginValidator,
  registerValidator,
  resetPasswordValidator,
  verifyAccountTokenVaildator,
  verifyEmailVaildator,
} from '@v1/validators/auth';
import Bcrypt from 'bcrypt';
import * as database from '@utils/database';
import logger from '@root/utils/logger';
import { generateToken, validateToken } from '@root/utils/jwt';
import prisma from '@root/utils/prisma';
import { forgetPasswordEmail, verifyAccountEmail, welcomeEmail } from '@root/utils/mailer';
import { isAuth } from '../middlewares/authGuards';
import config from '@root/config';
import { CDNRequest } from '@root/types';
import { decrypt, encrypt } from '@root/utils/helper';
import { SessionType } from '@root/constants';

const router = Router();

router.post(
  '/register',
  registerValidator,
  async (req: Request, res: Response): Promise<void | Response> => {
    try {
      const { username, email, password } = req.body;
      const findUser = await database.users.get({ email });
      if (findUser)
        return res.status(400).json({
          message: 'User already exists with this email',
        });

      const hashedPassword = await Bcrypt.hash(password, config.SALT_ROUNDS);

      const user = {
        username,
        email,
        password: hashedPassword,
        avatar: `https://ui-avatars.com/api/?name=${username}`,
      };

      await database.users
        .createUser(user)
        .then(async (user): Promise<void | Response> => {
          const newUser = await database.users.get({ email: user.email });

          // const ip = (await req.headers['x-forwarded-for']) || req.socket.remoteAddress;
          const genToken = await generateToken('AUTH', { id: newUser.id });
          const enToken = await encrypt(genToken, 'JWT_TOKEN');
          const session = await database.sessions.createSession({
            data: enToken.data,
            iv: enToken.iv,
            type: SessionType.AUTH,
            User: { connect: { id: newUser.id } },
            expire: new Date(Date.now() + 604800000),
          });

          welcomeEmail(user.email, user.username);
          res.status(201).json({
            message: 'User created successfully',
            token: session.token,
          });
        })
        .catch((err) => {
          logger.error(err);
          res.status(500).json({
            code: 'Internal Server Error',
            message: 'Internal Server Error while registering user',
          });
        });
    } catch (err) {
      return res.status(400).json({ message: err });
    }
  },
);

router.post(
  '/login',
  loginValidator,
  async (req: Request, res: Response): Promise<void | Response> => {
    try {
      const { email, password } = req.body;

      const user = await database.users.get({ email });
      if (!user)
        return res.status(404).json({
          message: 'User not found',
        });

      const isValidPassword = await Bcrypt.compare(password, user.password);

      if (!isValidPassword)
        return res.status(401).json({
          message: 'Invalid password',
        });

      // const ip = (await req.headers['x-forwarded-for']) || req.socket.remoteAddress;
      const genToken = await generateToken('AUTH', { id: user.id });
      const enToken = await encrypt(genToken, 'JWT_TOKEN');
      const session = await database.sessions.createSession({
        data: enToken.data,
        iv: enToken.iv,
        type: SessionType.AUTH,
        User: { connect: { id: user.id } },
        expire: new Date(Date.now() + 604800000),
      });

      res.status(200).json({
        message: 'Logged in successfully',
        token: session.token,
      });
    } catch (err) {
      return res.status(400).json({ message: err });
    }
  },
);

router.post(
  '/forget-password',
  forgetPasswordValidator,
  async (req: Request, res: Response): Promise<void | Response> => {
    try {
      const { email } = req.body;

      const user = await database.users.get({ email });
      if (!user)
        return res.status(400).json({
          message: 'Invalid email',
        });

      // const ip = (await req.headers['x-forwarded-for']) || req.socket.remoteAddress;
      const genToken = await generateToken('FORGET', { id: user.id });
      const enToken = await encrypt(genToken, 'JWT_TOKEN');
      const session = await database.sessions.createSession({
        data: enToken.data,
        iv: enToken.iv,
        type: SessionType.FORGET_PASSWORD,
        User: { connect: { id: user.id } },
        expire: new Date(Date.now() + 604800000),
      });

      forgetPasswordEmail(user.email, session.token);

      res.status(200).json({
        message: 'Password reset email sent',
        token: session.token,
      });
    } catch (err) {
      return res.status(400).json({ message: err });
    }
  },
);

router.post(
  '/forget-password/:token',
  async (req: Request, res: Response): Promise<void | Response> => {
    try {
      const token = req.params.token;
      const { password } = req.body;

      const session = await database.sessions.get({ token });
      if (!session) return res.status(400).json({ message: 'Invalid token' });
      if (session.type != SessionType.FORGET_PASSWORD)
        return res.status(400).json({ message: 'Invalid token type' });

      const decryptedToken = await decrypt({ iv: session.iv, data: session.data }, 'JWT_TOKEN');

      const tokenValidation = await validateToken('FORGET', decryptedToken);
      if (!tokenValidation)
        return res.status(401).json({
          message: 'Invalid token',
        });

      const user = await database.users.getById(tokenValidation.id);
      if (!user)
        return res.status(404).json({
          message: 'User not found',
        });

      const hashedPassword = await Bcrypt.hash(password, config.SALT_ROUNDS);

      await prisma.user
        .update({
          where: {
            id: user.id,
          },
          data: {
            password: hashedPassword,
          },
        })
        .then(() => {
          logger.warn(`Updated user ${user.id}`);
          res.status(200).json({
            message: 'Password updated',
          });
        })
        .catch((err) => {
          logger.error(err);
          res.status(500).json({
            code: 'Internal Server Error',
            message: 'Internal Server Error while updating password',
          });
        });
    } catch (err) {
      return res.status(400).json({ message: err });
    }
  },
);

router.post(
  '/reset-password',
  isAuth,
  resetPasswordValidator,
  async (req: CDNRequest, res: Response): Promise<void | Response> => {
    try {
      const { password } = req.body;

      const hashedPassword = await Bcrypt.hash(password, 16);

      await prisma.user
        .update({
          where: {
            id: req.user.id,
          },
          data: {
            password: hashedPassword,
          },
        })
        .then(() => {
          logger.warn(`Updated user ${req.user.id}`);
          res.status(200).json({
            message: 'Password updated',
          });
        })
        .catch((err) => {
          logger.error(err);
          res.status(500).json({
            code: 'Internal Server Error',
            message: 'Internal Server Error while updating password',
          });
        });
    } catch (err) {
      return res.status(400).json({ message: err });
    }
  },
);

router.post(
  '/validate-token/:token',
  async (req: Request, res: Response): Promise<void | Response> => {
    try {
      const token = req.params.token;

      // const ip = (await req.headers['x-forwarded-for']) || req.socket.remoteAddress;
      // const userIp = await checkUserIp(ip.toString());
      // if (!userIp) return res.status(400).json({ message: 'Error when trying to get user ip' });

      const session = await database.sessions.get({ token });
      if (!session) return res.status(400).json({ message: 'Invalid token' });
      // if (session.ip !== userIp) return res.status(401).json({ message: 'New login location' });
      if (session.type != SessionType.AUTH)
        return res.status(400).json({ message: 'Invalid token type' });

      if (session.expire <= new Date()) {
        const genToken = await generateToken('VERIFY', { id: session.userId });
        const enToken = await encrypt(genToken, 'JWT_TOKEN');

        await prisma.session.update({
          where: { token },
          data: { iv: enToken.iv, data: enToken.data, expire: new Date(Date.now() + 604800000) },
        });

        return res.status(201).json({ message: 'Your token has been refresh' });
      }

      const decodedToken = await decrypt({ iv: session.iv, data: session.data }, 'JWT_TOKEN');

      const tokenValidation = await validateToken('AUTH', decodedToken);
      if (!tokenValidation)
        return res.status(401).json({
          message: 'Invalid token',
        });

      res.status(200).json({
        message: 'Token valid',
      });
    } catch (err) {
      return res.status(400).json({ message: err });
    }
  },
);

router.post(
  '/verify-email',
  verifyEmailVaildator,
  async (req: Request, res: Response): Promise<void | Response> => {
    try {
      const { email } = req.body;

      const user = await database.users.get(email);
      if (!user)
        return res.status(404).json({
          message: 'Invalid email',
        });

      // const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      const genToken = await generateToken('VERIFY', { id: user.id });
      const enToken = await encrypt(genToken, 'JWT_TOKEN');
      const session = await database.sessions.createSession({
        data: enToken.data,
        iv: enToken.iv,
        type: SessionType.VERIFY_ACCOUNT,
        User: { connect: { id: user.id } },
        expire: new Date(Date.now() + 604800000),
      });

      verifyAccountEmail(user.email, session.token);

      res.status(200).json({
        message: 'Verification email sent',
      });
    } catch (err) {
      return res.status(400).json({ message: err });
    }
  },
);

router.get(
  '/verify/:token',
  isAuth,
  verifyAccountTokenVaildator,
  async (req: Request, res: Response): Promise<void | Response> => {
    try {
      const token = req.params.token;

      const session = await database.sessions.get({ token });
      if (!session) return res.status(400).json({ message: 'Invalid token' });
      if (session.type != SessionType.VERIFY_ACCOUNT)
        return res.status(400).json({ message: 'Invalid token type' });

      const decryptedToken = await decrypt({ iv: session.iv, data: session.data }, 'JWT_TOKEN');

      const tokenValidation = await validateToken('VERIFY', decryptedToken);
      if (!tokenValidation)
        return res.status(401).json({
          message: 'Invalid token',
        });

      const user = await database.users.getById(tokenValidation.id);
      if (!user)
        return res.status(404).json({
          message: 'User not found',
        });

      await prisma.session.delete({
        where: {
          token,
        },
      });

      await prisma.user
        .update({
          where: {
            id: user.id,
          },
          data: {
            verified: true,
          },
        })
        .then(() => {
          logger.warn(`Verified user ${user.id}`);
          res.status(200).json({
            message: 'Email verified',
          });
        })
        .catch((err) => {
          logger.error(err);
          res.status(500).json({
            code: 'Internal Server Error',
            message: 'Internal server error while verifying email',
          });
        });
    } catch (err) {
      return res.status(400).json({ message: err });
    }
  },
);

export default router;
