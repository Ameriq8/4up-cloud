import { Prisma } from '@prisma/client';
import prisma from '@utils/prisma';
import { User } from '@root/types';

export const get = async (where: Prisma.UserWhereInput): Promise<User> => {
  return await prisma.user.findFirst({ where });
};

// export const getUnique = async (where: Prisma.UserWhereUniqueInput): Promise<User> => {
//   const user = await prisma.user.findUnique({ where });
//   return user;
// };

export const getById = async (id: number): Promise<User> => {
  return get({ id });
};

export const getAllUsers = async () => {
  return await prisma.user.findMany();
};

export const createUser = async (data: Prisma.UserCreateInput): Promise<User> => {
  return await prisma.user.create({ data });
};
