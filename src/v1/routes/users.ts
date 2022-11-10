import { Router, Response } from 'express';
import { CDNRequest } from '@root/types';
import * as database from '@utils/database';
import { isAuth } from '@v1/middlewares/authGuards';
import { userUpdateData } from '../validators/users';
import prisma from '@utils/prisma';

const router = Router();

router.get('/', isAuth, async (req: CDNRequest, res: Response): Promise<void | Response> => {
  try {
    const user = await database.users.getById(req.user.id);
    delete user.password;
    res.status(200).json(user);
  } catch (err) {
    return res.status(503).json({ message: err });
  }
});

router.patch(
  '/',
  isAuth,
  userUpdateData,
  async (req: CDNRequest, res: Response): Promise<void | Response> => {
    try {
      await prisma.user.update({ where: { id: req.user.id }, data: req.body });
      res.status(200).json(req.body);
    } catch (err) {
      return res.status(400).json({ message: err });
    }
  },
);

export default router;
