import jwt from 'jsonwebtoken';
import { UserToken } from '@root/types';
import config from '@root/config';

interface generateTokenData {
  id: number;
}

type tokenType = 'AUTH' | 'FORGET' | 'VERIFY';

export const generateToken = async (type: tokenType, data: generateTokenData): Promise<string> => {
  switch (type) {
    case 'AUTH':
      return await generateJwt(data, config.SECRETS.AUTH_TOKEN_SECRET, '7d', 'HS256');

    case 'FORGET':
      return await generateJwt(data, config.SECRETS.FORGET_TOKEN_SECRET, '1h', 'HS256');

    case 'VERIFY':
      return await generateJwt(data, config.SECRETS.VERIFY_TOKEN_SECRET, '1h', 'HS256');

    default:
      return null;
  }
};

export const validateToken = async (type: tokenType, token: string): Promise<UserToken | any> => {
  switch (type) {
    case 'AUTH':
      return await verifyTokenMethod(token, config.SECRETS.AUTH_TOKEN_SECRET);

    case 'FORGET':
      return await verifyTokenMethod(token, config.SECRETS.FORGET_TOKEN_SECRET);

    case 'VERIFY':
      return await verifyTokenMethod(token, config.SECRETS.VERIFY_TOKEN_SECRET);

    default:
      return null;
  }
};

export const generateJwt = (
  data: generateTokenData,
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
