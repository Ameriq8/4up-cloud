import { Router, Response } from 'express';
import { CDNRequest } from '@root/types';
import * as database from '@utils/database';
import { isAuth } from '@v1/middlewares/authGuards';

const router = Router();

router.get('/', isAuth, async (req: CDNRequest, res: Response) => {
  const user = await database.users.getById(req.user.id);
  delete user.password
  res.status(200).json(user);
});

export default router;
