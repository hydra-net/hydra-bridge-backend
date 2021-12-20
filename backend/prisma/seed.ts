import { PrismaClient } from "@prisma/client";
import { tokens } from "./seeds/tokens";
import { bridges } from "./seeds/bridges";
import { chains } from "./seeds/chains";
import { chains_tokens } from "./seeds/chains_tokens";
import { bridges_tokens } from "./seeds/bridges_tokens";
import { routes } from "./seeds/routes";

const prisma = new PrismaClient();

async function main() {
  await prisma.token.createMany({
    data: tokens,
  });
  await prisma.bridge.createMany({
    data: bridges,
  });
  await prisma.chain.createMany({
    data: chains,
  });
  await prisma.chainsOnTokens.createMany({
    data: chains_tokens,
  });
  await prisma.bridgesOnTokens.createMany({
    data: bridges_tokens,
  });
  await prisma.route.createMany({
    data: routes,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
