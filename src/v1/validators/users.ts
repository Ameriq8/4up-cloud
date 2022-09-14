import { body } from 'express-validator';
import validator from '@utils/validator';

export const userUpdateData = validator([
  body('username').optional().isLength({ min: 2, max: 32 }).withMessage({
    code: 'InvalidLength',
    content: 'Must be between 2 and 32 in length',
  }),
]);
