import jwt from 'jsonwebtoken';
import { UserToken } from '@root/types';
import config from '@root/config';

export const generateToken = async (type: string, data: object): Promise<string> => {
  switch (type) {
    case 'auth':
      return await generateJwt(data, config.secrets.auth_token_secret, '7d', 'HS256');

    case 'forget':
      return await generateJwt(data, config.secrets.forget_token_secret, '1h', 'HS256');

    case 'verify':
      return await generateJwt(data, config.secrets.verify_token_secret, '1h', 'HS256');

    default:
      return null;
  }
};

export const validateToken = async (type: string, token: string): Promise<UserToken | any> => {
  switch (type) {
    case 'auth':
      return await verifyTokenMethod(token, config.secrets.auth_token_secret);

    case 'forget':
      return await verifyTokenMethod(token, config.secrets.forget_token_secret);

    case 'verify':
      return await verifyTokenMethod(token, config.secrets.verify_token_secret);

    default:
      return null;
  }
};

export const generateJwt = (
  data: object,
  secret: string,
  expire: string,
  algorithm: string,
): Promise<string> => {
  return new Promise((resolve, reject) => {
    jwt.sign(
      data,
      secret,
      {
        expiresIn: expire,
        algorithm: algorithm,
      },
      (err: any, token: string | PromiseLike<string>) => {
        if (err) reject(err);
        else resolve(token);
      },
    );
  });
};

export const verifyTokenMethod = (token: string, secret: string): Promise<UserToken | any> => {
  return jwt.verify(
    token,
    secret,
    (err: { message: any }, decoded: UserToken | PromiseLike<UserToken>) => {
      if (err) return err.message;
      else return decoded;
    },
  );
};
