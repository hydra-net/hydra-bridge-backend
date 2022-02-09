import prisma from "./db";

export const getRouteWithBridges = async (
  routeId: number,
  chainFromId: number,
  chainToId: number
) => {
  return await prisma.route.findFirst({
    where: {
      id: routeId,
      chain_from_id: chainFromId,
      chain_to_id: chainToId,
    },
    include: {
      bridge: {
        select: {
          name: true,
          is_testnet: true,
        },
      },
    },
  });
};
