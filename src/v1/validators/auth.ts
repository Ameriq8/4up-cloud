import { body, param } from 'express-validator';
import validator from '@utils/validator';

export const registerValidator = validator([
  body('username')
    .notEmpty()
    .withMessage({
      code: 'Missing Required Field',
      content: 'Username is required field',
    })
    .isLength({ min: 2, max: 32 })
    .withMessage({
      code: 'Invalid Length',
      content: 'Username must be between 2 and 32 in length',
    }),
  body('email')
    .notEmpty()
    .withMessage({
      code: 'Missing Required Field',
      content: 'Email is required field',
    })
    .isEmail()
    .withMessage({
      code: 'InvalidEmail',
      content: 'Email must be a valid email',
    })
    .isLength({ min: 6, max: 255 }),
  body('password')
    .notEmpty()
    .withMessage({
      code: 'Missing Required Field',
      content: 'Password is required field',
    })
    .isLength({ min: 8, max: 64 })
    .withMessage({
      code: 'Invalid Length',
      content: 'Must be between 8 and 64 in length',
    }),
]);

export const loginValidator = validator([
  body('email')
    .notEmpty()
    .withMessage({
      code: 'Missing Required Field',
      content: 'Email is required field',
    })
    .isEmail()
    .withMessage({
      code: 'InvalidEmail',
      content: 'Must be a valid email',
    })
    .isLength({ min: 6, max: 255 })
    .withMessage({
      code: 'Invalid Length',
      content: 'Must be between 6 and 255 in length',
    }),
  body('password')
    .notEmpty()
    .withMessage({
      code: 'Missing Required Field',
      content: 'Password is required field',
    })
    .isLength({ min: 8, max: 64 })
    .withMessage({
      code: 'Invalid Length',
      content: 'Must be between 8 and 64 in length',
    }),
]);

export const forgetPasswordValidator = validator([
  body('email')
    .notEmpty()
    .withMessage({
      code: 'Missing Required Field',
      content: 'Email is required field',
    })
    .isEmail()
    .withMessage({
      code: 'InvalidEmail',
      content: 'Must be a valid email',
    })
    .isLength({ min: 6, max: 255 }),
]);

export const forgetPasswordTokenValidator = validator([
  param('token')
    .notEmpty()
    .withMessage({
      code: 'Missing Required Param',
      content: 'Token is required param',
    })
    .isJWT()
    .withMessage({
      code: 'Invalid Token',
      content: 'Must be a valid JWT',
    }),
]);

export const resetPasswordValidator = validator([
  body('password')
    .notEmpty()
    .withMessage({
      code: 'Missing Required Field',
      content: 'Password is required field',
    })
    .isLength({ min: 8, max: 64 })
    .withMessage({
      code: 'Invalid Length',
      content: 'Must be between 8 and 64 in length',
    }),
]);

export const verifyEmailVaildator = validator([
  body('email')
    .notEmpty()
    .withMessage({
      code: 'Missing Required Field',
      content: 'Email is required field',
    })
    .isEmail()
    .withMessage({
      code: 'Invalid Email',
      content: 'Must be a valid email',
    })
    .isLength({ min: 6, max: 255 })
    .withMessage({
      code: 'Invalid Length',
      content: 'Must be between 8 and 64 in length',
    }),
]);

export const verifyAccountTokenVaildator = validator([
  param('token')
    .notEmpty()
    .withMessage({
      code: 'Missing Required Param',
      content: 'Token is required param',
    })
    .isJWT()
    .withMessage({
      code: 'Invalid Token',
      content: 'Must be a valid JWT',
    }),
]);
