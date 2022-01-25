import { PrismaClient } from "@prisma/client";
import { tokens } from "./seeds/tokens";
import { bridges } from "./seeds/bridges";
import { chains } from "./seeds/chains";
import { chains_tokens } from "./seeds/chains_tokens";
import { bridges_tokens } from "./seeds/bridges_tokens";
import { routes } from "./seeds/routes";

const prisma = new PrismaClient();

async function main() {
  for (const token of tokens) {
    const dbToken = await prisma.token.findFirst({
      where: { address: token.address },
    });

    if (!dbToken) {
      await prisma.token.create({
        data: token,
      });
    }
  }

  for (const bridge of bridges) {
    const dbBridge = await prisma.bridge.findFirst({
      where: { name: bridge.name },
    });

    if (!dbBridge) {
      await prisma.bridge.create({
        data: bridge,
      });
    }
  }

  for (const chain of chains) {
    const dbChain = await prisma.chain.findFirst({
      where: { name: chain.name },
    });

    if (!dbChain) {
      await prisma.chain.create({
        data: chain,
      });
    }
  }

  for (const chainToken of chains_tokens) {
    const dbChainToken = await prisma.chainsOnTokens.findFirst({
      where: { chain_id: chainToken.chain_id, token_id: chainToken.token_id },
    });

    if (!dbChainToken) {
      await prisma.chainsOnTokens.create({
        data: chainToken,
      });
    }
  }

  for (const bridgeToken of bridges_tokens) {
    const dbBridgeToken = await prisma.bridgesOnTokens.findFirst({
      where: {
        bridge_id: bridgeToken.bridge_id,
        token_id: bridgeToken.token_id,
      },
    });

    if (!dbBridgeToken) {
      await prisma.bridgesOnTokens.create({
        data: bridgeToken,
      });
    }
  }

  for (const route of routes) {
    const dbRoute = await prisma.route.findFirst({
      where: {
        chain_from_id: route.chain_from_id,
        chain_to_id: route.chain_to_id,
        bridge_id: route.bridge_id,
      },
    });

    if (!dbRoute) {
      await prisma.route.create({
        data: route,
      });
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
