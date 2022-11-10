import { Prisma } from '@prisma/client';
import prisma from '@utils/prisma';
import { Session } from '@root/types';

export const get = async (where: Prisma.SessionWhereInput): Promise<Session> => {
  return await prisma.session.findFirst({ where });
};

export const createSession = async (data: Prisma.SessionCreateInput): Promise<Session> => {
  return await prisma.session.create({ data });
};
