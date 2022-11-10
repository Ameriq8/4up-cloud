import { Prisma } from '@prisma/client';
import prisma from '@utils/prisma';
import { File } from '@root/types';

export const get = async (where: Prisma.FileWhereInput): Promise<File> => {
  return await prisma.file.findFirst({ where });
};

export const getById = async (id: number): Promise<File> => {
  return get({ id });
};

export const getMany = async (where: Prisma.FileWhereInput): Promise<File[]> => {
  return await prisma.file.findMany({ where });
};

export const createFile = async (data: Prisma.FileCreateInput): Promise<File> => {
  return await prisma.file.create({ data });
};
