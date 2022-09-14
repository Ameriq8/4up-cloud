import { Router, Request, Response } from 'express';
import { forgetPasswordValidator, loginValidator, registerValidator, resetPasswordValidator, verifyAccountTokenVaildator, verifyEmailVaildator } from '@v1/validators/auth';
import Bcrypt from 'bcrypt';
import * as database from '@utils/database';
import logger from '@root/utils/logger';
import { generateToken, validateToken } from '@root/utils/jwt';
import prisma from '@root/utils/prisma';
import { forgetPasswordEmail, verifyAccountEmail, welcomeEmail } from '@root/utils/mailer';
import { isAuth } from '../middlewares/authGuards';
import config from '@root/config';

const router = Router();

router.post('/register', registerValidator, async (req: Request, res: Response) => {
  const { username, email, password } = req.body;
  const findUser = await database.users.get({email});
  if (findUser)
    return res.status(400).json({
      code: 'User Already Exists',
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
    .then(async () => {
      const newUser = await database.users.get({ email: user.email })
      const token = await generateToken('auth', { id: newUser.id, email: user.email });
      welcomeEmail(user.email, user.username);
      res.status(201).json({
        message: 'User created successfully',
        token,
      });
    })
    .catch((err) => {
      logger.error(err);
      res.status(500).json({
        code: 'Internal Server Error',
        message: 'Internal Server Error while registering user',
      });
    });
});

router.post('/login', loginValidator, async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await database.users.get({email});
  if (!user)
    return res.status(404).json({
      message: 'User not found',
    });

  const isValidPassword = await Bcrypt.compare(password, user.password);

  if (!isValidPassword)
    return res.status(401).json({
      message: 'Invalid password',
    });

  const token = await generateToken('auth', { id: user.id, email: user.email });

  res.status(200).json({
    message: 'Logged in successfully',
    token,
  });
});

router.post('/forget-password', forgetPasswordValidator, async (req: Request, res: Response) => {
  const { email } = req.body;

  const user = await database.users.get({email});
  if (!user)
    return res.status(404).json({
      message: 'Invalid email',
    });

  const token = await generateToken('forget', { id: user.id, email: user.email });

  forgetPasswordEmail(user.email, token);

  res.status(200).json({
    message: 'Password reset email sent',
    token
  });
});

router.post('/forget-password/:token', async (req: Request, res: Response) => {
  const token = req.params.token;
  const { password } = req.body;

  const tokenValidation = await validateToken('forget', token);
  if (!tokenValidation)
    return res.status(401).json({
      message: 'Invalid token',
    });

  const user = await database.users.getById(tokenValidation.id);
  if (!user)
    return res.status(404).json({
      message: 'User not found',
    });

  const hashedPassword = await Bcrypt.hash(password, 16);

  await prisma.user.update({
    where: {
      id: user.id
    },
    data: {
      password: hashedPassword
    }
  }).then(() => {
    logger.warn(`Updated user ${user.id}`);
    res.status(200).json({
      message: 'Password updated',
    });
  }).catch((err) => {
    logger.error(err);
    res.status(500).json({
      code: 'Internal Server Error',
      message: 'Internal Server Error while updating password',
    });
  });
});

router.post('/reset-password', isAuth, resetPasswordValidator, async (req: Request, res: Response) => {
  const { password } = req.body;

  const hashedPassword = await Bcrypt.hash(password, 16);

  await prisma.user.update({
    where: {
      id: req.user.id
    },
    data: {
      password: hashedPassword
    }
  }).then(() => {
    logger.warn(`Updated user ${req.user.id}`);
    res.status(200).json({
      message: 'Password updated',
    });
  }).catch((err) => {
    logger.error(err);
    res.status(500).json({
      code: 'Internal Server Error',
      message: 'Internal Server Error while updating password',
    });
  });
});

router.post('/validate-token/:token', async (req: Request, res: Response) => {
  const token = req.params.token;
  const tokenValidation = await validateToken('auth', token);
  if (!tokenValidation)
    return res.status(401).json({
      message: 'Invalid token',
    });

  res.status(200).json({
    message: 'Token valid',
  });
});

router.post('/verify-email', verifyEmailVaildator, async (req: Request, res: Response) => {
  const { email } = req.body;

  const user = await database.users.get(email);
  if (!user)
    return res.status(404).json({
      message: 'Invalid email',
    });

  const token = await generateToken('verify', { id: user.id, email: user.email });

  verifyAccountEmail(user.email, token);

  res.status(200).json({
    message: 'Verification email sent',
  });
});

router.get('/verify/:token', verifyAccountTokenVaildator, async (req: Request, res: Response) => {
  const token = req.params.token;
  const tokenValidation = await validateToken('verify', token);
  if (!tokenValidation)
    return res.status(401).json({
      message: 'Invalid token',
    });

  const user = await database.users.getById(tokenValidation.id);
  if (!user)
    return res.status(404).json({
      message: 'User not found',
    });

  await await prisma.user.update({
    where: {
      id: user.id
    },
    data: {
      verified: true
    }
  }).then(() => {
    logger.warn(`Verified user ${user.id}`);
    res.status(200).json({
      message: 'Email verified',
    });
  }).catch((err) => {
    logger.error(err);
    res.status(500).json({
      code: 'Internal Server Error',
      message: 'Internal server error while verifying email',
    });
  });
});

export default router;
