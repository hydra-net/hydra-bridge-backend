import prisma from "./db";

export const getChainToken = async (chainId: number, tokenId: number) =>
  await prisma.chainsOnTokens.findFirst({
    where: { chain_id: chainId, token_id: tokenId },
  });
