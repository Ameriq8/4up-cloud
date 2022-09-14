import { matchedData, validationResult, ValidationChain, ValidationError } from 'express-validator';
import { Request, Response, RequestHandler, NextFunction } from 'express';
import logger from '@utils/logger';

interface FormatterError {
  [key: string]: {
    code: string;
    location: string;
    message: string;
  };
}

/**
 * @param {ValidationError} error
 */

export const formatter = (error: ValidationError): FormatterError => {
  logger.error(error);
  return {
    [error.param]: {
      code: error.msg.code,
      location: error.location,
      message: error.msg.content,
    },
  };
};

/**
 * @param {ValidationChain[]} validations
 */

export default (validations: ValidationChain[]): RequestHandler => {
  return async (req: Request & { data: unknown }, res: Response, next: NextFunction) => {
    for (const validation of validations) {
      // sequential processing, stops running validations chain if the previous one have failed.
      const result = await validation.run(req);
      if (result.context.errors.length) break;
    }

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      // https://express-validator.github.io/docs/matched-data-api.html
      req.data = matchedData(req, { includeOptionals: false });
      return next();
    }

    res.status(400).json({
      code: 'Invalid Request',
      errors: errors.formatWith(formatter).array()[0],
      message: 'Invalid Form Request Data',
    });
  };
};
