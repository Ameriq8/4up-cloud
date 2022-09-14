import dotenv from 'dotenv';

dotenv.config();

const config = {
  node_env: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  port: Number(process.env.PORT) || 3001,
  secrets: {
    auth_token_secret: process.env.AUTH_TOKEN_SECRET,
    forget_token_secret: process.env.FORGET_TOKEN_SECRET,
    verify_token_secret: process.env.VERIFY_TOKEN_SECRET,
  },
  SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,
  APP_URL: process.env.APP_URL || 'http://localhost:3001',
  MAILER_DOMAIN: process.env.MAILER_DOMAIN || 'abebe5387@gmail.com',
  TEST_USER_TOKEN: process.env.TEST_USER_TOKEN,
  SALT_ROUNDS: Number(process.env.SALT_ROUNDS) || 11,
  AWS_S3: {
    ACCESS_KEY_ID: process.env.ACCESS_KEY_ID,
    SECRET_ACCESS_KEY: process.env.SECRET_ACCESS_KEY,
    ENDPOINT: process.env.ENDPOINT,
  },
};

export default config;
