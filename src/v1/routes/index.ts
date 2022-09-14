import { Router, Request, Response } from 'express';
import users from './users';
import auth from './auth';
import cdn from './cdn';

const router = Router();

router.get('/', (_: Request, res: Response) => {
  res.status(200).json({
    message: 'API is working :D',
  });
});

router.use('/users', users);
router.use('/auth', auth);
router.use('/cdn', cdn);

export default router;
