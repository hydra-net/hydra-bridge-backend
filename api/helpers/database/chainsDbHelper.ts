import prisma from "./db";

export const getChainByChainId = async (chainId: number) =>
  await prisma.chain.findFirst({
    where: {
      chainId,
    },
  });

export const getChainsWithToken = async (isTestnet: boolean) =>
  await prisma.chain.findMany({
    where: {
      is_testnet: isTestnet,
    },
    include: {
      token: {
        select: {
          id: true,
          name: true,
          address: true,
          decimals: true,
          symbol: true,
        },
      },
    },
  });
