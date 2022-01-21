/*
  Warnings:

  - You are about to drop the `Bridge` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `BridgesOnTokens` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Chain` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ChainsOnTokens` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Route` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Token` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "BridgesOnTokens" DROP CONSTRAINT "BridgesOnTokens_bridge_id_fkey";

-- DropForeignKey
ALTER TABLE "BridgesOnTokens" DROP CONSTRAINT "BridgesOnTokens_token_id_fkey";

-- DropForeignKey
ALTER TABLE "Chain" DROP CONSTRAINT "Chain_token_id_fkey";

-- DropForeignKey
ALTER TABLE "ChainsOnTokens" DROP CONSTRAINT "ChainsOnTokens_chain_id_fkey";

-- DropForeignKey
ALTER TABLE "ChainsOnTokens" DROP CONSTRAINT "ChainsOnTokens_token_id_fkey";

-- DropForeignKey
ALTER TABLE "Route" DROP CONSTRAINT "Route_bridge_id_fkey";

-- DropForeignKey
ALTER TABLE "Route" DROP CONSTRAINT "Route_chain_from_id_fkey";

-- DropForeignKey
ALTER TABLE "Route" DROP CONSTRAINT "Route_chain_to_id_fkey";

-- DropTable
DROP TABLE "Bridge";

-- DropTable
DROP TABLE "BridgesOnTokens";

-- DropTable
DROP TABLE "Chain";

-- DropTable
DROP TABLE "ChainsOnTokens";

-- DropTable
DROP TABLE "Route";

-- DropTable
DROP TABLE "Token";

-- CreateTable
CREATE TABLE "chain" (
    "id" SERIAL NOT NULL,
    "chainId" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "is_l1" BOOLEAN NOT NULL DEFAULT false,
    "is_testnet" BOOLEAN NOT NULL DEFAULT false,
    "is_sending_enabled" BOOLEAN NOT NULL DEFAULT false,
    "is_receiving_enabled" BOOLEAN NOT NULL DEFAULT false,
    "token_id" INTEGER NOT NULL,
    "explorers" TEXT[],

    CONSTRAINT "chain_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "token" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "address" VARCHAR(255) NOT NULL,
    "decimals" INTEGER NOT NULL,
    "symbol" VARCHAR(255) NOT NULL,

    CONSTRAINT "token_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chains_tokens" (
    "id" SERIAL NOT NULL,
    "chain_id" INTEGER NOT NULL,
    "token_id" INTEGER NOT NULL,

    CONSTRAINT "chains_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bridge" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "display_name" VARCHAR(255) NOT NULL,
    "is_testnet" BOOLEAN NOT NULL DEFAULT false,
    "processing_time_seconds" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "bridge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bridges_tokens" (
    "id" SERIAL NOT NULL,
    "bridge_id" INTEGER NOT NULL,
    "token_id" INTEGER NOT NULL,

    CONSTRAINT "bridges_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "route" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_claimable" BOOLEAN NOT NULL DEFAULT false,
    "chain_from_id" INTEGER NOT NULL,
    "chain_to_id" INTEGER NOT NULL,
    "bridge_id" INTEGER NOT NULL,

    CONSTRAINT "route_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "chain_chainId_key" ON "chain"("chainId");

-- AddForeignKey
ALTER TABLE "chain" ADD CONSTRAINT "chain_token_id_fkey" FOREIGN KEY ("token_id") REFERENCES "token"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chains_tokens" ADD CONSTRAINT "chains_tokens_chain_id_fkey" FOREIGN KEY ("chain_id") REFERENCES "chain"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chains_tokens" ADD CONSTRAINT "chains_tokens_token_id_fkey" FOREIGN KEY ("token_id") REFERENCES "token"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bridges_tokens" ADD CONSTRAINT "bridges_tokens_bridge_id_fkey" FOREIGN KEY ("bridge_id") REFERENCES "bridge"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bridges_tokens" ADD CONSTRAINT "bridges_tokens_token_id_fkey" FOREIGN KEY ("token_id") REFERENCES "token"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "route" ADD CONSTRAINT "route_chain_from_id_fkey" FOREIGN KEY ("chain_from_id") REFERENCES "chain"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "route" ADD CONSTRAINT "route_chain_to_id_fkey" FOREIGN KEY ("chain_to_id") REFERENCES "chain"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "route" ADD CONSTRAINT "route_bridge_id_fkey" FOREIGN KEY ("bridge_id") REFERENCES "bridge"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
