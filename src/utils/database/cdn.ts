import { Prisma } from '@prisma/client';
import prisma from '@utils/prisma';
import logger from '@utils/logger';
import { File } from '@root/types';

export const get = async (where: Prisma.FileWhereInput): Promise<File> => {
  const file = await prisma.file.findFirst({ where });
  logger.info(file);
  return file;
};

export const getById = async (id: number): Promise<File> => {
  return get({ id });
};

export const getMany = async (where: Prisma.FileWhereInput): Promise<File[]> => {
  const files = await prisma.file.findMany({ where });
  logger.info(files);
  return files;
};

export const createFile = async (data: Prisma.FileCreateInput): Promise<File> => {
  const file = await prisma.file.create({ data });
  logger.info(file);
  return file;
};
