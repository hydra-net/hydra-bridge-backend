import prisma from "./db";

export const getTokenById = async (id: number) =>
  await prisma.token.findFirst({
    where: {
      id,
    },
  });

export const getTokenByAddress = async (address: string) =>
  await prisma.token.findFirst({
    where: { address },
  });
