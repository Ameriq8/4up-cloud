import { body, param } from 'express-validator';
import validator from '@utils/validator';

export const deleteFileValidator = validator([
  body('key')
    .notEmpty()
    .withMessage({
      code: 'Missing Required Field',
      content: 'key is required field',
    })
    .isLength({ min: 2 })
    .withMessage({
      code: 'Invalid Length',
      content: 'Must be minimum length is 2',
    }),
]);

export const getFileValidator = validator([
  param('key')
    .notEmpty()
    .withMessage({
      code: 'Missing Required Field',
      content: 'key is required field',
    })
    .isLength({ min: 2 })
    .withMessage({
      code: 'Invalid Length',
      content: 'Must be minimum length is 2',
    }),
]);
