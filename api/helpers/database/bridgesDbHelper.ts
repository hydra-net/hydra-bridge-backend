import prisma from "./db";

export const getAllBridges = async () => {
  return await prisma.bridge.findMany();
};
