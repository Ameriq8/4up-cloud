import RateLimit from 'express-rate-limit';

export const userUpdateInfoLimiter = RateLimit({
  windowMs: 15 * 60 * 1000,
  max: 2, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  message: 'Too many requests, please try again later.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

export const createAccountLimiter = RateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3, // Limit each IP to 3 create account requests per `window` (here, per hour)
  message: 'Too many accounts created from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
