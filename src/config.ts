import dotenv from 'dotenv';

dotenv.config();

const config = {
  NODE_ENV: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  PORT: Number(process.env.PORT) || 3001,
  SECRETS: {
    AUTH_TOKEN_SECRET: process.env.AUTH_TOKEN_SECRET,
    FORGET_TOKEN_SECRET: process.env.FORGET_TOKEN_SECRET,
    VERIFY_TOKEN_SECRET: process.env.VERIFY_TOKEN_SECRET,
    TOKEN_HASH_SECRET: process.env.TOKEN_HASH_SECRET || "TOKEN_HASH_SECRET",
    DATA_HASH_SECRET: process.env.DATA_HASH_SECRET || "TOKEN_HASH_SECRETs"
  },
  SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,
  APP_URL: process.env.APP_URL || 'http://localhost:3001',
  MAILER_DOMAIN: process.env.MAILER_DOMAIN || 'abebe5387@gmail.com',
  TEST_USER_TOKEN: process.env.TEST_USER_TOKEN,
  SALT_ROUNDS: Number(process.env.SALT_ROUNDS) || 11,
  ALGORITHMS: {
    HASH_ALGORITHM: process.env.HASH_ALGORITHM,
  },
  AWS_S3: {
    ACCESS_KEY_ID: process.env.ACCESS_KEY_ID,
    SECRET_ACCESS_KEY: process.env.SECRET_ACCESS_KEY,
    ENDPOINT: process.env.ENDPOINT,
  },
  BUCKET_NAME: process.env.BUCKET_NAME,
};

export default config;
