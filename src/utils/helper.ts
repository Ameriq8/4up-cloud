import crypto from 'crypto';
import { HashedObject } from '@root/types';
import config from '@root/config';
import axios from 'axios';
import logger from './logger';

type strType = 'JWT_TOKEN' | 'NORMAL_DATA';

export const encrypt = async (str: string, type: strType): Promise<HashedObject> => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(
    config.ALGORITHMS.HASH_ALGORITHM,
    type === 'NORMAL_DATA' ? config.SECRETS.DATA_HASH_SECRET : config.SECRETS.TOKEN_HASH_SECRET,
    iv,
  );
  const encrypted = Buffer.concat([cipher.update(str), cipher.final()]);
  return {
    iv: iv.toString('hex'),
    data: encrypted.toString('hex'),
  };
};

export const decrypt = async (hash: HashedObject, type: strType): Promise<string> => {
  const decipher = crypto.createDecipheriv(
    config.ALGORITHMS.HASH_ALGORITHM,
    type === 'NORMAL_DATA' ? config.SECRETS.DATA_HASH_SECRET : config.SECRETS.TOKEN_HASH_SECRET,
    Buffer.from(hash.iv, 'hex'),
  );
  const decrpyted = Buffer.concat([
    decipher.update(Buffer.from(hash.data, 'hex')),
    decipher.final(),
  ]);
  return decrpyted.toString();
};

type GetIpRegistryResponse = {
  data: {
    ip: string;
  };
};

export const checkUserIp = async (ip: string): Promise<string | boolean> => {
  try {
    const { data } = await axios.get<GetIpRegistryResponse>(
      `https://api.ipregistry.co/${ip}?key=o8huin142bddspf8&fields=ip`,
    );
    return data['ip'];
  } catch (err) {
    if (axios.isAxiosError(err)) {
      logger.error('Axios Error: ', err.message);
      return false;
    } else {
      logger.error('Unexpected error: ', err);
      return false;
    }
  }
};
