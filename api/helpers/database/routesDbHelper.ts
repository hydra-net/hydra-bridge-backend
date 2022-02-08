import prisma from "./db";

export const getRoutesByChainBridgeIds = async (
  chainFromId: number,
  chainToId: number,
  bridgeIds: number[]
) =>
  await prisma.route.findMany({
    where: {
      chain_from_id: chainFromId,
      chain_to_id: chainToId,
      bridge_id: { in: bridgeIds },
    },
  });
