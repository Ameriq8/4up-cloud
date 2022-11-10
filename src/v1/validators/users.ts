import { body } from 'express-validator';
import validator from '@utils/validator';

export const userUpdateData = validator([
  body('username').optional().isLength({ min: 2, max: 32 }).withMessage({
    code: 'Invalid Length',
    content: 'Must be between 2 and 32 in length',
  }),
  body('bio').optional().isLength({ min: 4, max: 320 }).withMessage({
    code: 'Invalid Length',
    content: 'Must be between 4 and 320 in length',
  }),
  body('deleted').optional().isBoolean().withMessage({
    code: 'Invalid Data Type',
    content: 'Must be true or false',
  }),
  body('avatar').optional(),
]);
