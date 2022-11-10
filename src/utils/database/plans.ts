import { Prisma } from '@prisma/client';
import prisma from '@utils/prisma';
import { BusinessPlan } from '@root/types';

export const get = async (where: Prisma.BusinessPlanWhereInput): Promise<BusinessPlan> => {
  return await prisma.businessPlan.findFirst({ where });
};

export const createBusinessPlan = async (
  data: Prisma.BusinessPlanCreateInput,
): Promise<BusinessPlan> => {
  return await prisma.businessPlan.create({ data });
};
